import { Shopify } from "@shopify/shopify-api"
import config from "../config.js"
import sessionStorage from "../helpers/sessionStorage.js"
// import { webhookTopics } from "../constants.js"
import dbService from "./db.service.js"
const { Settings, Session } = dbService
// import { getImport, dynamicFileExists } from "./dynamicFiles.service.js"

async function handleStoreUninstall() {
    try {
        await Settings.put("isInstalled", false)
        const allSessionsInDB = await Session.list()
        for await (const session of allSessionsInDB) {
            await Session.deleteById(session.id)
        }
        console.log("App: Store uninstalled, cleared all sessions")
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
        console.log("App: Initialized Shopify Context")
    } catch (error) {
        console.error("Error during Shopify Context init, exiting.", error)
        process.exit(1)
    }
}

function addExistingHandlers(topics, getHandler) {
    try {
        for (const topic of topics) {
            Shopify.Webhooks.Registry.addHandler(topic, {
                path: "/webhooks",
                webhookHandler: getHandler(topic),
            })
        }
    } catch (error) {
        console.error(
            "Error while registering existing webhooks, exiting.",
            error
        )
        process.exit(1)
    }
    console.log("App: Added existing webhook handlers to registry")
}

function addUninstallHandler() {
    try {
        Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
            path: "/webhooks",
            webhookHandler: handleStoreUninstall,
        })
        console.log("App: Registered uninstall webhook")
    } catch (error) {
        console.error(
            "Error while registering APP_UNINSTALLED webhook, exiting.",
            error
        )
        process.exit(1)
    }
}

async function reRegisterExistingWebhooks() {
    try {
        const offlineSession = await Shopify.Utils.loadOfflineSession(
            config.SHOP
        )
        const response = await Shopify.Webhooks.Registry.registerAll({
            shop: config.SHOP,
            accessToken: offlineSession.accessToken,
            path: "/webhooks",
        })

        const addedTopics = Shopify.Webhooks.Registry.getTopics()
        for (const topic of addedTopics) {
            if (!response[topic].success) {
                console.error(response.result)
                throw new Error(`Failed to register ${topic} webhook`)
            }
        }

        console.log("App: Re-registered existing webhooks")
    } catch (error) {
        console.error("Error while registering webhooks, exiting.", error)
        process.exit(1)
    }
}

function createApiClient(accessToken, isGraphql = true) {
    try {
        let client
        if (isGraphql) {
            client = new Shopify.Clients.Graphql(config.SHOP, accessToken)
        } else {
            client = new Shopify.Clients.Rest(config.SHOP, accessToken)
        }
        return client
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
    addUninstallHandler,
    createApiClient,
    Shopify,
    addExistingHandlers,
    reRegisterExistingWebhooks,
    // addAvailableTopicHandlers,
}

export default shopifyService
