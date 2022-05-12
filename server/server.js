import express from "express"
import cookieParser from "cookie-parser"
import { resolve } from "path"
import config from "./config.js"
import dbService from "./services/db.service.js"
import shopifyService from "./services/shopify.service.js"
import verifyRequest from "./middleware/verify-request.js"
import isShopInstalled from "./middleware/is-shop-installed.js"
import webhookRoutes from "./routes/webhook.routes.js"
import graphqlRoutes from "./routes/graphql.routes.js"
import cspHeaders from "./middleware/csp-headers.js"
import authRoutes from "./routes/auth.routes.js"
import apiRoutes from "./routes/api.routes.js"
import { errorConverter, errorHandler } from "./middleware/error.js"
const { Settings } = dbService
const { Shopify } = shopifyService
const router = express.Router()

function getViteDevOpts(root) {
    return {
        root,
        logLevel: config.isTest ? "error" : "info",
        server: {
            port: config.PORT,
            hmr: {
                protocol: "ws",
                host: "localhost",
                port: 64999,
                clientPort: 64999,
            },
            middlewareMode: "html",
        },
    }
}

async function setServerSettings(app) {
    let isShopInstalled
    try {
        isShopInstalled = await Settings.get("isInstalled")
    } catch (error) {
        console.error("Error while setting up express.js, exiting", error)
        process.exit(1)
    }
    app.set("top-level-oauth-cookie", config.TOP_LEVEL_OAUTH_COOKIE)
    app.set("is-shop-installed", isShopInstalled)
}

export async function createServer(
    root = process.cwd(),
    isProd = config.isProd
) {
    const app = express()
    await setServerSettings(app)
    app.use(cookieParser(Shopify.Context.API_SECRET_KEY))
    app.use("/auth", authRoutes)
    app.use("/webhooks", webhookRoutes)
    app.use("/graphql", verifyRequest(app), graphqlRoutes)
    app.use(express.json())
    app.use("/api", verifyRequest(app), apiRoutes)
    app.use(cspHeaders())
    app.use("/*", isShopInstalled())

    let vite
    if (!isProd) {
        vite = await import("vite").then(({ createServer }) =>
            createServer(getViteDevOpts(root))
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
        app.use("/*", (_req, res, _next) => {
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
