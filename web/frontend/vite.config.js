import react from "@vitejs/plugin-react"
import { dirname } from "path"
import { fileURLToPath } from "url"
import * as dotenv from "dotenv"
dotenv.config({ path: "../../.env" })

if (
    process.env.npm_lifecycle_event === "build" &&
    !process.env.CI &&
    !process.env.SHOPIFY_API_KEY
) {
    console.warn(
        "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
    )
}

const proxyOptions = {
    target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
    changeOrigin: false,
    secure: true,
    ws: false,
}

/**
 * @type {import('vite').UserConfig}
 */
const config = {
    root: dirname(fileURLToPath(import.meta.url)),
    define: {
        "process.env.SHOPIFY_API_KEY": JSON.stringify(
            process.env.SHOPIFY_API_KEY
        ),
        "process.env.HOST": JSON.stringify(process.env.HOST),
    },
    plugins: [react()],
    resolve: {
        // preserveSymlinks: true,
        alias: {
            path: "path-browserify",
        },
    },
    server: {
        port: Number(process.env.FRONTEND_PORT),
        // proxy: {
        //     "^/(\\?.*)?$": proxyOptions,
        //     "^/api(/|(\\?.*)?$)": proxyOptions,
        // },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./test/setup.js",
        deps: {
            inline: ["@shopify/react-testing"],
        },
    },
}

export default config
