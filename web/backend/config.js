import { ApiVersion } from "@shopify/shopify-api"
import * as dotenv from "dotenv"
dotenv.config({ path: "../../.env" })

const optionalVars = [
    "PORT",
    "FRONTEND_PORT",
    "BACKEND_PORT",
    "VITE_TEST_BUILD",
    "GOOGLE_APPLICATION_CREDENTIALS",
]

const requiredVars = [
    "NODE_ENV",
    "SHOPIFY_API_KEY",
    "SHOPIFY_API_SECRET",
    "SHOP",
    "HOST",
    "SCOPES",
    "SERVER_SECRET",
    "FIREBASE_DB_URL",
    "FIREBASE_BUCKET",
    "FIREBASE_PROJECT_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
]

const configVars = {
    TOP_LEVEL_OAUTH_COOKIE: "shopify_top_level_oauth",
    SHOPIFY_API_VERSION: ApiVersion.July22,
}

function validate() {
    for (const key of requiredVars) {
        if (!process.env[key]) {
            console.error(`Environment variable missing: "${key}". Exiting.`)
            process.exit(1)
        }
    }
}

function createConfig() {
    const config = {}
    for (const key of optionalVars) {
        config[key] = process.env[key]
    }
    for (const key of requiredVars) {
        config[key] = process.env[key]
    }
    Object.assign(config, configVars)
    config.BACKEND_PORT = parseInt(config.BACKEND_PORT || config.PORT, 10)
    config.FRONTEND_PORT = parseInt(config.FRONTEND_PORT, 10)
    config.isTest = config.NODE_ENV === "test" || !!config.VITE_TEST_BUILD
    config.isProd = config.NODE_ENV === "production"
    config.isDev = config.NODE_ENV === "development"

    return config
}

validate()

const config = createConfig()

export default config
