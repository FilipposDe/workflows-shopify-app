// @ts-check
import { resolve } from "path"
import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath, pathToFileURL } from "url"

import cookieParser from "cookie-parser"
import { Shopify, ApiVersion } from "@shopify/shopify-api"
import "dotenv/config"
import applyAuthMiddleware from "./middleware/auth.js"
import { errorConverter, errorHandler } from "./middleware/error.js"
import sessionStorage from "./helpers/sessionStorage.js"
import catchAsync from "./helpers/catchAsync.js"
import { Settings, Workflows } from "./services/db.service.js"
import verifyRequest from "./middleware/verify-request.js"
import { getImport, initServerFiles } from "./services/dynamicFiles.js"
import { webhookData } from "./constants.js"
import apiRoutes from "./routes.js"

const USE_ONLINE_TOKENS = true
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth"

const PORT = parseInt(process.env.PORT || "8081", 10)
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD

Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SCOPES.split(","),
    HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
    API_VERSION: ApiVersion.April22,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: sessionStorage,
})

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
    path: "/webhooks",
    webhookHandler: async () => {
        await Settings.put("isInstalled", false)
    },
})

for (const webhook of webhookData) {
    Shopify.Webhooks.Registry.addHandler(webhook.topic, {
        path: "/webhooks",
        webhookHandler: async (data) => {
            const { default: defaultHandler } = getImport(webhook.fileName)
            await defaultHandler(data)
            console.log("Webhook was handled")
        },
    })
}

await initServerFiles()

export async function createServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === "production"
) {
    const app = express()
    app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE)
    const isShopInstalled = await Settings.get("isInstalled")
    app.set("is-shop-installed", isShopInstalled)
    app.set("use-online-tokens", USE_ONLINE_TOKENS)

    app.use(cookieParser(Shopify.Context.API_SECRET_KEY))

    applyAuthMiddleware(app)

    app.post("/webhooks", async (req, res) => {
        try {
            await Shopify.Webhooks.Registry.process(req, res)
            console.log(`Webhook processed, returned status code 200`)
        } catch (error) {
            console.log(`Failed to process webhook: ${error}`)
            if (!res.headersSent) {
                res.status(500).send(error.message)
            }
        }
    })

    app.post("/graphql", verifyRequest(app), async (req, res) => {
        try {
            const response = await Shopify.Utils.graphqlProxy(req, res)
            res.status(200).send(response.body)
        } catch (error) {
            res.status(500).send(error.message)
        }
    })

    app.use(express.json())

    app.use("/api", verifyRequest(app), apiRoutes)

    app.use((req, res, next) => {
        const shop = req.query.shop
        if (Shopify.Context.IS_EMBEDDED_APP && shop) {
            res.setHeader(
                "Content-Security-Policy",
                `frame-ancestors https://${shop} https://admin.shopify.com;`
            )
        } else {
            res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`)
        }
        next()
    })

    app.use("/*", (req, res, next) => {
        const { shop } = req.query

        // Detect whether we need to reinstall the app, any request from Shopify will
        // include a shop in the query parameters.
        if (!app.get("is-shop-installed") && shop) {
            res.redirect(`/auth?${new URLSearchParams(req.query).toString()}`)
        } else {
            next()
        }
    })

    /**
     * @type {import('vite').ViteDevServer}
     */
    let vite
    if (!isProd) {
        vite = await import("vite").then(({ createServer }) =>
            createServer({
                root,
                logLevel: isTest ? "error" : "info",
                server: {
                    port: PORT,
                    hmr: {
                        protocol: "ws",
                        host: "localhost",
                        port: 64999,
                        clientPort: 64999,
                    },
                    middlewareMode: "html",
                },
            })
        )
        app.use(vite.middlewares)
    } else {
        const compression = await import("compression").then(
            ({ default: fn }) => fn
        )
        const serveStatic = await import("serve-static").then(
            ({ default: fn }) => fn
        )
        const fs = await import("fs")
        app.use(compression())
        app.use(serveStatic(resolve("dist/client")))
        app.use("/*", (req, res, next) => {
            // Client-side routing will pick up on the correct route to render, so we always render the index here
            res.status(200)
                .set("Content-Type", "text/html")
                .send(
                    fs.readFileSync(`${process.cwd()}/dist/client/index.html`)
                )
        })
    }

    app.use(errorConverter)

    app.use(errorHandler)

    return { app, vite }
}

if (!isTest) {
    createServer().then(({ app }) => app.listen(PORT))
}
