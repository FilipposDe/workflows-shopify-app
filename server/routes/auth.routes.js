import express from "express"
import { DEBUG_MSG } from "../helpers/constants.js"
import catchAsync from "../helpers/catchAsync.js"
import topLevelAuthRedirect from "../helpers/top-level-auth-redirect.js"
import dbService from "../services/db.service.js"
import shopifyService from "../services/shopify.service.js"
const { Shopify } = shopifyService
const { Settings } = dbService

const authRoutes = express.Router()

authRoutes.get(
    "/install",
    catchAsync(async (req, res) => {
        // 1. Create a redirect URL and redirect to Shopify
        console.log(DEBUG_MSG.BEGIN_OFFLINE_AUTH)
        const IS_ONLINE = false
        const redirectUrl = await Shopify.Auth.beginAuth(
            req,
            res,
            req.query.shop,
            "/auth/callback",
            IS_ONLINE
        )
        console.log(DEBUG_MSG.OK_AUTH_REDIR_SHOPIFY)
        res.redirect(redirectUrl)
    })
)

authRoutes.get(
    "/",
    catchAsync(async (req, res) => {
        // 1. Fix top level cookie
        console.log(DEBUG_MSG.CHECKING_TOP_COOKIE)
        const topLevelCookie = req.app.get("top-level-oauth-cookie")
        const reqHasTopLevelCookie = req.signedCookies[topLevelCookie]
        if (!reqHasTopLevelCookie) {
            console.log(DEBUG_MSG.NO_TOP_COOKIE)
            const queryStr = new URLSearchParams(req.query).toString()
            const topLevelRouteRedirect = `/auth/toplevel?${queryStr}`
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
            "/auth/callback",
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
                console.log(DEBUG_MSG.REGISTERING_W_HOOKS)
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
                    throw new Error("Failed to register uninstall webhook")
                }

                // 3. Redirect to online auth flow
                console.log(DEBUG_MSG.FINISHED_REDIR_TO_ONLINE)
                res.redirect(`/auth?shop=${session.shop}`)
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
                    console.error(
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
                    console.error(
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
