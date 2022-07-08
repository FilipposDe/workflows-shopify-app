import { useAppBridge } from "@shopify/app-bridge-react"

class HttpError extends Error {
    constructor(message, httpStatus) {
        super(message)
        this.name = "HttpError"
        this.httpStatus = httpStatus
    }
}

function useFetch() {
    const app = useAppBridge()
    const appFetch = userLoggedInFetch(app)

    async function fetchAPI(
        url,
        method = "GET",
        data,
        headers = { "Content-Type": "application/json" }
    ) {
        try {
            const opts = {
                headers,
                method,
            }

            if (["POST", "PATCH", "PUT"].includes(method)) {
                opts.body =
                    data instanceof FormData ? data : JSON.stringify(data)
            }

            const response = await appFetch(url, opts)

            const isJson = response.headers
                .get("content-type")
                ?.includes("application/json")

            const responseData = isJson ? await response.json() : response

            if (!response.ok) {
                throw new HttpError(responseData.message, response.status)
            }

            return { responseData, error: null, status: response.status }
        } catch (error) {
            console.error(error)
            return {
                responseData: null,
                error: error.message || "Unknown error",
                status: error.httpStatus,
            }
        }
    }

    return fetchAPI
}

export default useFetch
