import shopifyService, { Shopify } from "../services/shopify.service"
import {catchAsync} from "../helpers"

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`

// This is an embedded app and the session is always online here
const IS_EMBEDDED = true
const IS_ONLINE = true

async function isSessionValidForApi(session) {
    if (typeof session?.isActive !== "function") return false
    if (!session.isActive()) return false
    try {
        const client = shopifyService.createApiClient(session.accessToken)
        await client.query({ data: TEST_GRAPHQL_QUERY })
        return true
    } catch (error) {
        if (
            error instanceof Shopify.Errors.HttpResponseError &&
            error.response.code === 401
        ) {
            return false
        } else {
            throw error
        }
    }
}

export default function verifyRequest(_app, opts = {}) {
    return catchAsync(async (req, res, next) => {
        const session = await Shopify.Utils.loadCurrentSession(
            req,
            res,
            IS_ONLINE
        )

        const shopQuery = req.query.shop

        // Request is made from some other shop
        if (shopQuery && session?.shop !== shopQuery) {
            // Show error, don't redirect since it's a one-store app
            return res.status(400).send(`Session is not for this shop (url)`)
        }

        // Session can successfully request from the GraphQL API
        if (isSessionValidForApi(session)) {
            return next()
        }

        const { returnHeader = true } = opts

        // Testing?
        if (!returnHeader) {
            res.redirect(`/auth?shop=${shopQuery}`)
            return
        }

        let finalShop
        if (shopQuery) {
            // Get shop from req.query (we know it's same as in the session)
            finalShop = shopQuery
        } else if (session) {
            // No shop query so get shop from session
            finalShop = session.shop
        } else if (IS_EMBEDDED) {
            // No query or session so try to get shop from AppBridge's Auth token
            const authHeader = req.headers.authorization
            const bearer = authHeader?.match(/Bearer (.*)/)
            if (bearer) {
                const payload = Shopify.Utils.decodeSessionToken(bearer[1])
                finalShop = payload.dest.replace("https://", "")
            }
        }

        // No shop found after all
        if (!finalShop) {
            return res
                .status(400)
                .send(
                    `Could not find a shop to authenticate with in URL, session, or Bearer token`
                )
        }

        // Found a shop, needs to auth again (since req. to Shopify API hadn't worked)
        res.status(403)
        res.header("X-Shopify-API-Request-Failure-Reauthorize", "1")
        res.header(
            "X-Shopify-API-Request-Failure-Reauthorize-Url",
            `/auth?shop=${finalShop}`
        )
        res.end()
    })
}
