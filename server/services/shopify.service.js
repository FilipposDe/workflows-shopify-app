import { Shopify, ApiVersion } from "@shopify/shopify-api"
import { webhookTopics } from "../constants.js"
import { Workflows, Settings } from "./db.service.js"
import { getImport, dynamicFileExists } from "./dynamicFiles.service.js"

async function handleStoreUninstall() {
        await Settings.put("isInstalled", false)

}

export function initShopifyContext() {
    Shopify.Context.initialize({
        API_KEY: process.env.SHOPIFY_API_KEY,
        API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
        SCOPES: process.env.SCOPES.split(","),
        HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
        API_VERSION: ApiVersion.April22,
        IS_EMBEDDED_APP: true,
        SESSION_STORAGE: sessionStorage,
    })
}


export function addUninstallHandler() {
    Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
    path: "/webhooks",
    webhookHandler: handleStoreUninstall,
})
}

export function addAvailableTopicHandlers() {
   for (const topic of webhookTopics) {
    Shopify.Webhooks.Registry.addHandler(topic, {
            path: "/webhooks",
            webhookHandler: async (data) => {
                const fileName = Workflows.getFileNameFromTopic(topic)
                if (dynamicFileExists(fileName)) {
                    const { default: defaultHandler } = getImport(fileName)
                    await defaultHandler(data)
                    console.log("Webhook was handled by file")
                    return 
                    // TODO continue work
                }
                console.log("Webhook was not handled by any file")
            },
        })
    }
}


