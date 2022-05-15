import react from "@vitejs/plugin-react"
import "dotenv/config"

/**
 * @type {import('vite').UserConfig}
 */
const config = {
    define: {
        "process.env.SHOPIFY_API_KEY": JSON.stringify(
            process.env.SHOPIFY_API_KEY
        ),
        "process.env.HOST": JSON.stringify(process.env.HOST),
    },
    plugins: [react()],
    resolve: {
        alias: {
            path: "path-browserify",
        },
    },
}

export default config
// export default {
//     define: {
//         "process.env.SHOPIFY_API_KEY": JSON.stringify(
//             process.env.SHOPIFY_API_KEY
//         ),
//         "process.env.HOST": JSON.stringify(process.env.HOST),
//     },
//     plugins: [react()],
//     resolve: {

//     },
// }
