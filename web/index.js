import config from "./server/config.js"
import { createServer } from "./server/server.js"
import dbService from "./server/services/db.service.js"
import dynamicFilesService from "./server/services/dynamicFiles.service.js"
import shopifyService from "./server/services/shopify.service.js"

console.log("App: Starting")

// Initialize the DB
dbService.init()

// Initialize the Shopify API
shopifyService.initContext()

// Add uninstall handler function to Webhooks Registry
shopifyService.addUninstallHandler()

// Load Workflow Constants from user settings
await dynamicFilesService.setConstants()

// Load Workflow files to Dynamic Files Registry
const foundTopics = await dynamicFilesService.initServerFiles()

// Add Workflow handlers to Webhooks Registry
shopifyService.addExistingHandlers(foundTopics, dynamicFilesService.getImport)

// Make sure all webhooks are registered with Shopify
await shopifyService.reRegisterExistingWebhooks()

if (!config.isTest) {
    const { app } = await createServer()
    app.listen(config.PORT)
    console.log(`App: Server listening on port ${config.PORT}`)
    console.log("App: Ready")
}
