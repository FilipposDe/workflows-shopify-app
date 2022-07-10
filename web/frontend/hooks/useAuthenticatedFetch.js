import { authenticatedFetch } from "@shopify/app-bridge-utils"
import { useAppBridge } from "@shopify/app-bridge-react"
import { Redirect } from "@shopify/app-bridge/actions"

/**
 * A hook that returns an auth-aware fetch function.
 * The returned fetch function that matches the browser's fetch API
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * It will provide the following functionality:
 *
 * 1. Add a `X-Shopify-Access-Token` header to the request.
 * 2. Check response for `X-Shopify-API-Request-Failure-Reauthorize` header.
 * 3. Redirect the user to the reauthorization URL if the header is present.
 *
 * @returns {Function} fetch function
 */
export function useAuthenticatedFetch() {
    const app = useAppBridge()
    const fetchFunction = authenticatedFetch(app)

    return async (uri, options) => {
        const response = await fetchFunction(uri, options)

        if (
            response.headers.get(
                "X-Shopify-API-Request-Failure-Reauthorize"
            ) === "1"
        ) {
            const authUrlHeader =
                response.headers.get(
                    "X-Shopify-API-Request-Failure-Reauthorize-Url"
                ) || "/api/auth"

            let redirectUrl = authUrlHeader
            if (authUrlHeader.startsWith("/")) {
                redirectUrl = `https://${window.location.host}${redirectUrl}`
            }

            const redirect = Redirect.create(app)
            redirect.dispatch(Redirect.Action.APP, redirectUrl)
            return null
        }

        return response
    }
}
