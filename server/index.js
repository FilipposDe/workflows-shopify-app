import config from "./config.js"
import dbService from "./services/db.service.js"
import shopifyService from "./services/shopify.service.js"
import { createServer } from "./server.js"

console.log("App: Starting")

dbService.init()
shopifyService.initContext()
shopifyService.addUninstallHandler()
shopifyService.addExistingHandlers([], () => {}) // TODO
await shopifyService.reRegisterExistingWebhooks()

if (!config.isTest) {
    const { app } = await createServer()
    app.listen(config.PORT)
    console.log(`App: Server listening on port ${config.PORT}`)
    console.log("App: Ready")
}

// await initServerFiles()
