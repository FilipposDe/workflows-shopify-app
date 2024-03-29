import express from "express"
import cookieParser from "cookie-parser"
import { resolve } from "path"
import { errorConverter, errorHandler } from "./middleware/error.js"
import isShopInstalled from "./middleware/is-shop-installed.js"
import authRoutes from "./routes/auth.routes.js"
import graphqlRoutes from "./routes/graphql.routes.js"
import apiRoutes from "./routes/api.routes.js"
import webhookRoutes from "./routes/webhook.routes.js"
import config from "./config.js"
import cspHeaders from "./middleware/csp-headers.js"
import logger from "./logger.js"
import dbService from "./services/db.service.js"
import shopifyService from "./services/shopify.service.js"
import verifyRequest from "./middleware/verify-request.js"
import { getViteReactPreamble } from "./helpers/util.js"

const { Settings } = dbService
const { Shopify } = shopifyService

async function setServerSettings(app) {
    let isShopInstalled
    try {
        isShopInstalled = await Settings.get("isInstalled")
    } catch (error) {
        logger.error("Error while setting up express.js, exiting", error)
        process.exit(1)
    }
    app.set("top-level-oauth-cookie", config.TOP_LEVEL_OAUTH_COOKIE)
    app.set("is-shop-installed", isShopInstalled)
}

export async function createServer(
    _root = process.cwd(),
    isProd = config.isProd
) {
    const app = express()

    await setServerSettings(app)
    app.use(cookieParser(Shopify.Context.API_SECRET_KEY))

    app.use("/api/auth", authRoutes)
    app.use("/api/webhooks", webhookRoutes)
    app.use("/api/*", verifyRequest(app))
    app.use("/api/graphql", graphqlRoutes)
    app.use("/api", express.json(), apiRoutes)

    if (isProd) {
        const compression = await import("compression").then(
            ({ default: fn }) => fn
        )
        const serveStatic = await import("serve-static").then(
            ({ default: fn }) => fn
        )
        app.use(compression())
        app.use(serveStatic(resolve("../frontend/dist")))
    }

    app.use("/*", cspHeaders(), isShopInstalled(), async (_req, res) => {
        const fs = await import("fs")
        const indexUrl = isProd
            ? `${process.cwd()}/../frontend/dist/index.html`
            : `${process.cwd()}/../frontend/index.html`

        let indexHtml = fs.readFileSync(indexUrl)
        if (!isProd) {
            // Inject preamble for React plugin on Dev.
            // The Vite React plugin does not transform the html
            // because we're serving the index.html directly with
            // the Vite dev server as a proxy.
            // https://vitejs.dev/guide/backend-integration.html
            indexHtml = indexHtml.toString().replace(
                "<head>",
                `<head>
                    ${getViteReactPreamble()}
                `
            )
        }

        res.status(200).set("Content-Type", "text/html").send(indexHtml)
    })

    app.use(errorConverter)
    app.use(errorHandler)

    return { app }
}
