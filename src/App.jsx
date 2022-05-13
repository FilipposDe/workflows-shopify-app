import {
    ApolloClient,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
} from "@apollo/client"
import {
    Provider as AppBridgeProvider,
    useAppBridge,
    useClientRouting,
    useNavigate,
} from "@shopify/app-bridge-react"
import { authenticatedFetch } from "@shopify/app-bridge-utils"
import { Redirect } from "@shopify/app-bridge/actions"
import { AppProvider as PolarisProvider } from "@shopify/polaris"
import translations from "@shopify/polaris/locales/en.json"
import "@shopify/polaris/build/esm/styles.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "./components/HomePage"
import Workflow from "./components/Workflow"
import CreateWorkflow from "./components/CreateWorkflow"
import ErrorBoundary from "./components/ErrorBoundary"

function MyRouterInner(props) {
    const navigate = useNavigate()
    function replace(path) {
        navigate(path)
    }
    useClientRouting({
        replace,
    })
    return null
}

const MyRouter = MyRouterInner

export default function App() {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <PolarisProvider i18n={translations}>
                    <AppBridgeProvider
                        config={{
                            apiKey: process.env.SHOPIFY_API_KEY,
                            host: new URL(location).searchParams.get("host"),
                            forceRedirect: true,
                        }}
                    >
                        <MyProvider>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route
                                    path="/new"
                                    element={<CreateWorkflow />}
                                />
                                <Route path="/:topic" element={<Workflow />} />
                            </Routes>
                        </MyProvider>
                        <MyRouter />
                    </AppBridgeProvider>
                </PolarisProvider>
            </ErrorBoundary>
        </BrowserRouter>
    )
}

function MyProvider({ children }) {
    const app = useAppBridge()

    const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
            credentials: "include",
            fetch: userLoggedInFetch(app),
        }),
    })

    return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export function userLoggedInFetch(app) {
    const fetchFunction = authenticatedFetch(app)

    return async (uri, options) => {
        const response = await fetchFunction(uri, options)

        if (
            response.headers.get(
                "X-Shopify-API-Request-Failure-Reauthorize"
            ) === "1"
        ) {
            const authUrlHeader = response.headers.get(
                "X-Shopify-API-Request-Failure-Reauthorize-Url"
            )

            const redirect = Redirect.create(app)
            redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`)
            return null
        }

        return response
    }
}
