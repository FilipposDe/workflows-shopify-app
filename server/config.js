import "dotenv/config"
import { ApiVersion } from "@shopify/shopify-api"

const optionalEnvVars = ["PORT", "VITE_TEST_BUILD"]

const requiredEnvVars = [
    "NODE_ENV",
    "SHOPIFY_API_KEY",
    "SHOPIFY_API_SECRET",
    "SHOP",
    "SCOPES",
    "HOST",
    "SERVER_SECRET",
    "FIREBASE_DB_URL",
    "FIREBASE_BUCKET",
    "FIREBASE_PROJECT_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS",
]

const configVars = {
    TOP_LEVEL_OAUTH_COOKIE: "shopify_top_level_oauth",
    SHOPIFY_API_VERSION: ApiVersion.April22,
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
    config.PORT = parseInt(process.env.PORT || "8081", 10)
    config.isTest = config.NODE_ENV === "test" || !!config.VITE_TEST_BUILD
    config.isProd = config.NODE_ENV === "production"
    config.isDev = config.NODE_ENV === "development"

    return config
}

validateEnv()
const config = generateConfigObj()

export default config
