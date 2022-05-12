import config from "./config.js"
import dbService from "./services/db.service.js"
import shopifyService from "./services/shopify.service.js"
import { createServer } from "./server.js"

console.log("App: Starting")

dbService.init()
shopifyService.initContext()
shopifyService.registerUninstallHandler()

if (!config.isTest) {
    const { app } = await createServer()
    app.listen(config.PORT)
    console.log(`App: Server listening on port ${config.PORT}`)
    console.log("App: Ready")
}

// for (const topic of webhookTopics) {
//     Shopify.Webhooks.Registry.addHandler(topic, {
//         path: "/webhooks",
//         webhookHandler: async (data) => {
//             const fileName = Workflows.getFileNameFromTopic(topic)
//             if (dynamicFileExists(fileName)) {
//                 const { default: defaultHandler } = getImport(fileName)
//                 await defaultHandler(data)
//                 console.log("Webhook was handled by file")
//                 return
//             }
//             console.log("Webhook was not handled by any file")
//         },
//     })
// }

// await initServerFiles()
