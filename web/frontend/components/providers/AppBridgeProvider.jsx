import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Provider } from "@shopify/app-bridge-react"
import { Banner, Layout, Page } from "@shopify/polaris"

/**
 * Stores the initial host param, returns the
 * config object for the App Bridge Provider.
 * @returns {Object}
 */
function useAppBridgeConfig() {
    const location = useLocation()
    // Store the host, which may be present initially,
    // but later removed by navigation.
    const [appBridgeConfig] = useState(() => {
        // Get from param or window
        const hostParam = new URLSearchParams(location.search).get("host")
        const host = hostParam || window.__SHOPIFY_DEV_HOST
        window.__SHOPIFY_DEV_HOST = host

        return {
            host,
            apiKey: process.env.SHOPIFY_API_KEY,
            forceRedirect: true,
        }
    })

    return appBridgeConfig
}

/**
 * Ensures that navigating inside the app updates the host URL.
 * @returns {Object}
 */
function useRouterConfig() {
    const location = useLocation()
    const navigate = useNavigate()

    const history = useMemo(
        () => ({
            replace: (path) => {
                navigate(path, { replace: true })
            },
        }),
        [navigate]
    )

    const routerConfig = useMemo(
        () => ({ history, location }),
        [history, location]
    )

    return routerConfig
}

const noApiKeyFoundHtml = (
    <Page narrowWidth>
        <Layout>
            <Layout.Section>
                <div style={{ marginTop: "100px" }}>
                    <Banner title="Missing Shopify API key" status="critical">
                        Your app is running without the SHOPIFY_API_KEY
                        environment variable. Please ensure that it is set when
                        running or building your React app.
                    </Banner>
                </div>
            </Layout.Section>
        </Layout>
    </Page>
)

/**
 * Wrapper for the App Bridge Provider.
 * @param {*} children
 * @returns {React.ReactElement}
 */
function AppBridgeProvider({ children }) {
    const appBridgeConfig = useAppBridgeConfig()
    const routerConfig = useRouterConfig()

    if (!process.env.SHOPIFY_API_KEY) return noApiKeyFoundHtml

    return (
        <Provider config={appBridgeConfig} router={routerConfig}>
            {children}
        </Provider>
    )
}

export default AppBridgeProvider
