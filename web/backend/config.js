import { ApiVersion } from "@shopify/shopify-api"
import * as dotenv from "dotenv"
dotenv.config({ path: "../../.env" })

const optionalEnvVars = [
    "BACKEND_PORT",
    "VITE_TEST_BUILD",
    "GOOGLE_APPLICATION_CREDENTIALS",
]

const requiredEnvVars = [
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

function validateEnv() {
    for (const key of requiredEnvVars) {
        if (!process.env[key]) {
            console.error(
                `Environment variable missing: ${key}. Shutting down app.`
            )
            process.exit(1)
        }
    }
}

function generateConfigObj() {
    const config = {}
    for (const key of optionalEnvVars) {
        config[key] = process.env[key]
    }
    for (const key of requiredEnvVars) {
        config[key] = process.env[key]
    }
    Object.assign(config, configVars)
    config.BACKEND_PORT = parseInt(config.BACKEND_PORT || "8081", 10)
    config.isTest = config.NODE_ENV === "test" || !!config.VITE_TEST_BUILD
    config.isProd = config.NODE_ENV === "production"
    config.isDev = config.NODE_ENV === "development"

    return config
}

validateEnv()
const config = generateConfigObj()

export default config
