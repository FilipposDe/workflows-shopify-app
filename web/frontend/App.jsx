import { BrowserRouter } from "react-router-dom"
import { NavigationMenu } from "@shopify/app-bridge-react"
import { AppProvider as PolarisProvider } from "@shopify/polaris"
import "@shopify/polaris/build/esm/styles.css"
import GraphQLProvider from "./components/providers/GraphQLProvider"
import AppBridgeProvider from "./components/providers/AppBridgeProvider"
import ErrorBoundary from "./components/ErrorBoundary"
import Routes from "./Routes"

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
