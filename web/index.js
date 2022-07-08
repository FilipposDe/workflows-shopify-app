import config from "./config.js"
import dbService from "./services/db.service.js"
import shopifyService from "./services/shopify.service.js"
import { createServer } from "./server.js"
import dynamicFilesService from "./services/dynamicFiles.service.js"
import logger from "./logger.js"

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
