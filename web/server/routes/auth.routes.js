import express from "express"
import catchAsync from "../helpers/catchAsync.js"
import { DEBUG_MSG } from "../helpers/constants.js"
import topLevelAuthRedirect from "../helpers/top-level-auth-redirect.js"
import logger from "../logger.js"
import dbService from "../services/db.service.js"
import shopifyService from "../services/shopify.service.js"

const { Shopify } = shopifyService
const { Settings } = dbService

const authRoutes = express.Router()

// Install route: Auth starts here. Redirects to Shopify,
// requesting offline token, and the user is redirected
// back to the app's callback route.
authRoutes.get(
    "/install",
    catchAsync(async (req, res) => {
        // 1. Create a redirect URL and redirect to Shopify
        console.log(DEBUG_MSG.BEGIN_OFFLINE_AUTH)
        if (!req.query.shop) return res.status(500).send("Missing shop param")
        // The auth is Offline initially
        const IS_ONLINE = false
        const redirectUrl = await Shopify.Auth.beginAuth(
            req,
            res,
            req.query.shop,
            "/api/auth/callback",
            IS_ONLINE
        )
        console.log(DEBUG_MSG.OK_AUTH_REDIR_SHOPIFY)
        res.redirect(redirectUrl)
    })
)

// Online auth route: After offline auth is complete, user
// is redirected here to start the online auth process.
// The user can also be redirected here if the online auth is
// not valid, without having to install the app again.
// After the top level cookie is set, the user is redirected
// to the app's callback route, this time with an online token
authRoutes.get(
    "/",
    catchAsync(async (req, res) => {
        // 1. Fix top level cookie
        console.log(DEBUG_MSG.CHECKING_TOP_COOKIE)
        if (!req.query.shop) res.status(500).send("Missing shop param")

        const topLevelCookie = req.app.get("top-level-oauth-cookie")
        const reqHasTopLevelCookie = req.signedCookies[topLevelCookie]
        if (!reqHasTopLevelCookie) {
            console.log(DEBUG_MSG.NO_TOP_COOKIE)
            const topLevelRouteRedirect = `/api/auth/toplevel?shop=${req.query.shop}`
            res.redirect(topLevelRouteRedirect)
            return
        }

        // 2. Create online redirect and redirect to Shopify
        console.log(DEBUG_MSG.BEGIN_ONLINE_AUTH)
        const IS_ONLINE = true
        const redirectUrl = await Shopify.Auth.beginAuth(
            req,
            res,
            req.query.shop,
            "/api/auth/callback",
            IS_ONLINE
        )
        console.log(DEBUG_MSG.OK_AUTH_REDIR_SHOPIFY)
        res.redirect(redirectUrl)
    })
)

authRoutes.get("/toplevel", (req, res) => {
    console.log(DEBUG_MSG.SENDING_TOP_LVL_DOC)
    res.cookie(req.app.get("top-level-oauth-cookie"), "1", {
        signed: true,
        httpOnly: true,
        sameSite: "strict",
    })

    const html = topLevelAuthRedirect({
        apiKey: Shopify.Context.API_KEY,
        hostName: Shopify.Context.HOST_NAME,
        shop: req.query.shop,
    })

    res.set("Content-Type", "text/html")
    res.send(html)
})

// Callback route: Shopify redirects to this route after
// a redirect. If the session returned from the callback
// is offline (before Shopify, user was at "/install"),
// completes installation and redirects to the app's
// online auth route. If it's online, the offline auth is
// already complete, so the user is redirected to the app's
// homepage.
authRoutes.get(
    "/callback",
    catchAsync(async (req, res) => {
        let isOnline
        try {
            // 0. Validate the request
            console.log(DEBUG_MSG.VALIDATING_CB)
            const session = await Shopify.Auth.validateAuthCallback(
                req,
                res,
                req.query
            )
            isOnline = session.isOnline

            if (!isOnline) {
                // 1. Save installation to DB
                console.log(DEBUG_MSG.STORING_IS_INSTALLED)
                await Settings.put("isInstalled", true)
                req.app.set("is-shop-installed", true)

                // 2. Register webhooks // TODO rest
                const responses = await Shopify.Webhooks.Registry.registerAll({
                    shop: session.shop,
                    accessToken: session.accessToken,
                    path: "/webhooks", // TODO test
                })

                for (const [topic, response] of Object.entries(responses)) {
                    // GDPR webhooks can be ignored but
                    // they are not registered in this app
                    if (!response.success) {
                        const message = response.result.errors[0].message
                        logger.error(
                            `Failed to register ${topic} webhook: ${message}`
                        )
                    }
                }

                // 3. Redirect to online auth flow
                console.log(DEBUG_MSG.FINISHED_REDIR_TO_ONLINE)
                res.redirect(`/api/auth?shop=${session.shop}`)
            } else {
                // 1. Redirect to app with shop parameter upon auth
                console.log(DEBUG_MSG.FINISHED_REDIR_TO_APP)
                res.redirect(`/?shop=${session.shop}&host=${req.query.host}`)
            }
        } catch (error) {
            switch (true) {
                case error instanceof Shopify.Errors.InvalidOAuthError:
                    res.status(400)
                    res.send(error.message)
                    break
                case error instanceof Shopify.Errors.CookieNotFound:
                case error instanceof Shopify.Errors.SessionNotFound:
                    logger.error(
                        `Didn't find cookie or session, redirecting to ${
                            isOnline ? "/auth" : "/auth/install"
                        } again...`
                    )
                    // Likely because the session cookie has expired
                    res.redirect(
                        ` ${isOnline ? "/auth" : "/auth/install"}?shop=${
                            req.query.shop
                        }`
                    )
                    break
                default:
                    logger.error(
                        `Internal server error inside ${
                            isOnline ? "online" : "offline"
                        } auth callback`,
                        error
                    )
                    res.status(500)
                    res.send(error.message)
                    break
            }
        }
    })
)

export default authRoutes
