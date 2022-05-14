import express from "express"
import logger from "../logger.js"
import shopifyService from "../services/shopify.service.js"
const { Shopify } = shopifyService

const graphqlRoutes = express.Router()

graphqlRoutes.post("/", async (req, res) => {
    try {
        const response = await Shopify.Utils.graphqlProxy(req, res)
        res.status(200).send(response.body)
    } catch (error) {
        logger.error(error)
        res.status(500).send(error.message)
    }
})

export default graphqlRoutes
