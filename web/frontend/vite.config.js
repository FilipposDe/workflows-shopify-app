import { dirname } from "path"
import { fileURLToPath } from "url"
import * as dotenv from "dotenv"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

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

const host = process.env.HOST
    ? process.env.HOST.replace(/https:\/\//, "")
    : undefined

// HMR doesn't work on Firefox using localhost, so you can temporarily get that to work by setting the
// SHOPIFY_VITE_HMR_USE_POLLING env var when running this
let hmrConfig
if (process.env.SHOPIFY_VITE_HMR_USE_POLLING) {
    throw new Error("Env requires polling")
} else if (process.env.SHOPIFY_VITE_HMR_USE_WSS) {
    hmrConfig = {
        protocol: host ? "wss" : "ws",
        host: host || "localhost",
        port: process.env.FRONTEND_PORT,
        clientPort: 443,
    }
} else {
    hmrConfig = {
        protocol: "ws",
        host: "localhost",
        port: 64999,
        clientPort: 64999,
    }
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
    },
    esbuild: {
        jsxInject: `import React from 'react'`,
    },
    plugins: [react()],
    resolve: {
        preserveSymlinks: true,
        alias: {
            path: "path-browserify",
        },
    },
    server: {
        port: process.env.FRONTEND_PORT,
        proxy: {
            "^/(\\?.*)?$": proxyOptions,
            "^/api(/|(\\?.*)?$)": proxyOptions,
        },
        host: "localhost",
        hmr: hmrConfig,
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

export default defineConfig(config)
