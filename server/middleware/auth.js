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
        console.log("Debug: Checking top level cookie...")
        const topLevelCookie = app.get("top-level-oauth-cookie")
        const reqHasTopLevelCookie = req.signedCookies[topLevelCookie]
        if (!reqHasTopLevelCookie) {
            console.log(
                "Debug: No top level cookie, redirecting to /auth/toplevel..."
            )
            const queryStr = new URLSearchParams(req.query).toString()
            const topLevelRouteRedirect = `/auth/toplevel?${queryStr}`
            res.redirect(topLevelRouteRedirect)
            return
        }

        console.log("Debug: ...Ok. Begin auth...")
        const IS_ONLINE = false
        const redirectUrl = await Shopify.Auth.beginAuth(
            req,
            res,
            req.query.shop,
            OFFLINE_CB_URL,
            IS_ONLINE
        )

        console.log("Debug: ...Ok. Redirecting to Shopify...")
        res.redirect(redirectUrl)
    })

    app.get("/auth/toplevel", (req, res) => {
        console.log("Debug: Sending top level redirect doc...")

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
            console.log("Debug: Validating callback from Shopify...")

            const session = await Shopify.Auth.validateAuthCallback(
                req,
                res,
                req.query
            )

            console.log("Debug: Storing isInstalled...")
            await Settings.put("isInstalled", true)
            app.set("is-shop-installed", true)

            console.log("Debug: Registering all webhooks...")
            const response = await Shopify.Webhooks.Registry.registerAll({
                shop: session.shop,
                accessToken: session.accessToken,
                // topic: "APP_UNINSTALLED",
                path: "/webhooks",
            })

            if (!response["APP_UNINSTALLED"].success) {
                console.error(
                    `Failed to register APP_UNINSTALLED webhook: ${response.result}`
                )
            }

            console.log("Debug: Redirecting to / (app) with ?shop...")
            // Redirect to app with shop parameter upon auth
            res.redirect(`/?shop=${session.shop}&host=${req.query.host}`)
        } catch (e) {
            switch (true) {
                case e instanceof Shopify.Errors.InvalidOAuthError:
                    console.log("Debug: Caught InvalidOAuthError")
                    res.status(400)
                    res.send(e.message)
                    break
                case e instanceof Shopify.Errors.CookieNotFound:
                case e instanceof Shopify.Errors.SessionNotFound:
                    console.log(
                        "Debug: Didn't find cookie or session, redirecting to /auth again..."
                    )
                    // This is likely because the OAuth session cookie expired before the merchant approved the request
                    res.redirect(`/auth?shop=${req.query.shop}`)
                    break
                default:
                    console.log("Debug: An internal server error occured")
                    res.status(500)
                    res.send(e.message)
                    break
            }
        }
    })
}
