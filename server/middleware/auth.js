import { Shopify } from "@shopify/shopify-api"
import topLevelAuthRedirect from "../helpers/top-level-auth-redirect.js"
import dbService from "../services/db.service.js"
const { Settings } = dbService

const OFFLINE_AUTH_URL = "/auth"
const OFFLINE_CB_URL = "/auth/callback"
const ONLINE_AUTH_URL = "/auth-online"
const ONLINE_CB_URL = "/auth-online/callback"

export default function applyAuthMiddleware(app) {
    app.get(OFFLINE_AUTH_URL, async (req, res) => {
        const topLevelCookie = app.get("top-level-oauth-cookie")
        const reqHasTopLevelCookie = req.signedCookies[topLevelCookie]
        if (!reqHasTopLevelCookie) {
            const queryStr = new URLSearchParams(req.query).toString()
            const topLevelRouteRedirect = `/auth/toplevel?${queryStr}`
            res.redirect(topLevelRouteRedirect)
            return
        }

        const IS_ONLINE = false
        const redirectUrl = await Shopify.Auth.beginAuth(
            req,
            res,
            req.query.shop,
            OFFLINE_CB_URL,
            IS_ONLINE
        )

        res.redirect(redirectUrl)
    })

    app.get("/auth/toplevel", (req, res) => {
        res.cookie(app.get("top-level-oauth-cookie"), "1", {
            signed: true,
            httpOnly: true,
            sameSite: "strict",
        })

        res.set("Content-Type", "text/html")

        res.send(
            topLevelAuthRedirect({
                apiKey: Shopify.Context.API_KEY,
                hostName: Shopify.Context.HOST_NAME,
                host: req.query.host,
                query: req.query,
            })
        )
    })

    app.get(OFFLINE_CB_URL, async (req, res) => {
        try {
            const session = await Shopify.Auth.validateAuthCallback(
                req,
                res,
                req.query
            )

            await Settings.put("isInstalled", true)
            app.set("is-shop-installed", true)

            const response = await Shopify.Webhooks.Registry.registerAll({
                shop: session.shop,
                accessToken: session.accessToken,
                // topic: "APP_UNINSTALLED",
                path: "/webhooks",
            })

            if (!response["APP_UNINSTALLED"].success) {
                console.log(
                    `Failed to register APP_UNINSTALLED webhook: ${response.result}`
                )
            }

            // Redirect to app with shop parameter upon auth
            res.redirect(`/?shop=${session.shop}&host=${req.query.host}`)
        } catch (e) {
            switch (true) {
                case e instanceof Shopify.Errors.InvalidOAuthError:
                    res.status(400)
                    res.send(e.message)
                    break
                case e instanceof Shopify.Errors.CookieNotFound:
                case e instanceof Shopify.Errors.SessionNotFound:
                    // This is likely because the OAuth session cookie expired before the merchant approved the request
                    res.redirect(`/auth?shop=${req.query.shop}`)
                    break
                default:
                    res.status(500)
                    res.send(e.message)
                    break
            }
        }
    })
}
