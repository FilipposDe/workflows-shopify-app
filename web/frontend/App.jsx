// } from "@shopify/app-bridge-react"
// import { authenticatedFetch } from "@shopify/app-bridge-utils"
// import { Redirect } from "@shopify/app-bridge/actions"
import { AppProvider as PolarisProvider } from "@shopify/polaris"
import translations from "@shopify/polaris/locales/en.json"
import "@shopify/polaris/build/esm/styles.css"
import { BrowserRouter } from "react-router-dom"
// import { BrowserRouter, Routes, Route } from "react-router-dom"
import GraphQLProvider from "./components/providers/GraphQLProvider"
import AppBridgeProvider from "./components/providers/AppBridgeProvider"
import ErrorBoundary from "./components/ErrorBoundary"
import { NavigationMenu } from "@shopify/app-bridge-react"
import Routes from "./Routes"
// import { HomePage } from "./components/HomePage"
// import Workflow from "./components/Workflow"

const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)")

export default function App() {
    return (
        <ErrorBoundary>
            <PolarisProvider>
                <BrowserRouter>
                    <AppBridgeProvider>
                        <GraphQLProvider>
                            <NavigationMenu
                                navigationLinks={[
                                    {
                                        label: "New workflow",
                                        destination: "/new",
                                    },
                                ]}
                            />
                            <Routes pages={pages} />
                        </GraphQLProvider>
                    </AppBridgeProvider>
                </BrowserRouter>
            </PolarisProvider>
        </ErrorBoundary>
    )
}

// export function userLoggedInFetch(app) {
// 	const fetchFunction = authenticatedFetch(app)

// 	return async (uri, options) => {
// 		const response = await fetchFunction(uri, options)

// 		if (
// 			response.headers.get(
// 				'X-Shopify-API-Request-Failure-Reauthorize'
// 			) === '1'
// 		) {
// 			const authUrlHeader = response.headers.get(
// 				'X-Shopify-API-Request-Failure-Reauthorize-Url'
// 			)

// 			const redirect = Redirect.create(app)
// 			redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`)
// 			return null
// 		}

// 		return response
// 	}
// }
