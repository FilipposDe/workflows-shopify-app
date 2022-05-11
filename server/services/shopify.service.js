import { Shopify } from "@shopify/shopify-api"
import config from "../config.js"
import sessionStorage from "../helpers/sessionStorage.js"
// import { webhookTopics } from "../constants.js"
import dbService from "./db.service.js"
const { Settings } = dbService
// import { getImport, dynamicFileExists } from "./dynamicFiles.service.js"

async function handleStoreUninstall() {
    try {
        await Settings.put("isInstalled", false)
        // TODO erase sessions and other cleanup
    } catch (error) {
        console.error("DB error while handling store uninstall", error)
    }
}

function initContext() {
    try {
        Shopify.Context.initialize({
            API_KEY: config.SHOPIFY_API_KEY,
            API_SECRET_KEY: config.SHOPIFY_API_SECRET,
            SCOPES: config.SCOPES.split(","),
            HOST_NAME: config.HOST.replace(/https:\/\//, ""),
            API_VERSION: config.SHOPIFY_API_VERSION,
            IS_EMBEDDED_APP: true,
            SESSION_STORAGE: sessionStorage,
        })
    } catch (error) {
        console.error("Error during Shopify Context init, exiting", error)
        process.exit(1)
    }
}

function registerUninstallHandler() {
    try {
        Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
            path: "/webhooks",
            webhookHandler: handleStoreUninstall,
        })
    } catch (error) {
        console.error(
            "Error while registering APP_UNINSTALLED webhook, exiting",
            error
        )
        process.exit(1)
    }
}

async function createApiClient(accessToken, isGraphql = true) {
    try {
        if (isGraphql) {
            const client = new Shopify.Clients.Graphql(config.SHOP, accessToken)
            return client
        } else {
            // TODO
            return
        }
    } catch (error) {
        console.error(error)
        throw new Error("Could not create Graphql client")
    }
}

// function addAvailableTopicHandlers() {
//     for (const topic of webhookTopics) {
//         Shopify.Webhooks.Registry.addHandler(topic, {
//             path: "/webhooks",
//             webhookHandler: async (data) => {
//                 const fileName = Workflows.getFileNameFromTopic(topic)
//                 if (dynamicFileExists(fileName)) {
//                     const { default: defaultHandler } = getImport(fileName)
//                     await defaultHandler(data)
//                     console.log("Webhook was handled by file")
//                     return
//                     // TODO continue work
//                 }
//                 console.log("Webhook was not handled by any file")
//             },
//         })
//     }
// }

const shopifyService = {
    handleStoreUninstall,
    initContext,
    registerUninstallHandler,
    createApiClient,
    Shopify,
    // addAvailableTopicHandlers,
}

export default shopifyService
