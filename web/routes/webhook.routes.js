import express from "express"
import logger from "../logger"
import shopifyService from "../services/shopify.service"

const { Shopify } = shopifyService

const webhookRoutes = express.Router()

webhookRoutes.post("/", async (req, res) => {
    try {
        await Shopify.Webhooks.Registry.process(req, res)
        console.log(`Webhook processed, returned status code 200`)
    } catch (error) {
        logger.error(`Failed to process webhook: ${error}`)
        if (!res.headersSent) {
            res.status(500).send(error.message)
        }
    }
})

export default webhookRoutes
