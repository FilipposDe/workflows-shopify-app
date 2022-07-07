import shopifyService from "../services/shopify.service.js"
import catchAsync from "../helpers/catchAsync.js"
const { Shopify } = shopifyService

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`

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
        const IS_ONLINE = true
        const session = await Shopify.Utils.loadCurrentSession(
            req,
            res,
            IS_ONLINE
        )

        const shopQuery = req.query.shop

        // Request is made from some other shop
        if (shopQuery && session?.shop !== shopQuery) {
            return res.status(400).send(`Session is not for this shop (url)`)
        }

        // Session works fine with the API
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

        // Get shop from req.query (we know it's same as in the session)
        if (shopQuery) {
            finalShop = shopQuery
        }

        // No shop query so get shop from session
        if (!shopQuery && session) {
            finalShop = session.shop
        }

        // No query and session so try to get shop from AppBridge's Auth token
        if (!shopQuery && !session && Shopify.Context.IS_EMBEDDED_APP) {
            const authHeader = req.headers.authorization
            const matches = authHeader?.match(/Bearer (.*)/)
            if (matches) {
                const payload = Shopify.Utils.decodeSessionToken(matches[1])
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

        // Found a shop, needs to auth again (since req. to Shopify hadn't worked)
        res.status(403)
        res.header("X-Shopify-API-Request-Failure-Reauthorize", "1")
        res.header(
            "X-Shopify-API-Request-Failure-Reauthorize-Url",
            `/auth?shop=${finalShop}`
        )
        res.end()
    })
}
