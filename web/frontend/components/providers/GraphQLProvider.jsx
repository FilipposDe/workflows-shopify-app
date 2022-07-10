import {
    QueryClient,
    QueryClientProvider,
    QueryCache,
    MutationCache,
} from "react-query"

/**
 * Wrapper for the QueryClientProvider from react-query.
 * @param {*} children
 * @returns {React.ReactElement}
 */
function GraphQLProvider({ children }) {
    const client = new QueryClient({
        queryCache: new QueryCache(),
        mutationCache: new MutationCache(),
    })

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default GraphQLProvider
