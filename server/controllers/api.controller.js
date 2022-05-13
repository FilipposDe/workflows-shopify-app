import config from "../config.js"
import ApiError from "../helpers/ApiError.js"
import catchAsync from "../helpers/catchAsync.js"
import dbService from "../services/db.service.js"
import shopifyService from "../services/shopify.service.js"
import files from "../services/dynamicFiles.service.js"
import { listTopicWebhooksQuery } from "../helpers/queries.js"
const { Shopify } = shopifyService
const { Workflows } = dbService
// TODO continue work

async function cleanupTopicHandler(topic) {
    // 1. Delete the webhook from Shopify
    const offlineSession = await Shopify.Utils.loadOfflineSession(config.SHOP)
    const clientG = shopifyService.createApiClient(offlineSession.accessToken)
    const allTopicWebhooksQuery = listTopicWebhooksQuery(topic)
    const result = await clientG.query({ data: allTopicWebhooksQuery })
    if (!result?.data?.webhookSubscriptions?.edges?.length) {
        // TODO it's okay if there's none, not okay if there are errors
        throw new ApiError(404, "Could not find this webhook on Shopify")
    }
    const ids = result.data.webhookSubscriptions.edges.map(
        (edge) => edge.node.id
    )
    const clientR = shopifyService.createApiClient(
        offlineSession.accessToken,
        false
    )
    for await (const id of ids) {
        await clientR.delete({
            path: `webhooks/${id}`,
        })
    }
    // 2. Remove handler from registry
    delete Shopify.Webhooks.Registry.webhookRegistry[topic]
    // 3. Remove handler from Dynamic Imports
    const fileName = Workflows.getFileNameFromTopic(topic)
    files.deleteImport(fileName)
    // 4. Delete file
    try {
        files.deleteDynamicFile(fileName)
    } catch (error) {
        console.error(error)
    }
}

async function createTopicHandler(topic, code) {
    // 1. Make sure the file is written
    const fileName = Workflows.getFileNameFromTopic(topic)
    files.addFile(fileName, code)
    // 2. Get handler (function object) by importing file
    const handlerFn = await files.dynamicallyImportFile(fileName)
    // 3. Add handler to registry
    Shopify.Webhooks.Registry.addHandler(topic, {
        path: "/webhooks",
        webhookHandler: handlerFn,
    })
    // 4. Register for webhook
    const offlineSession = await Shopify.Utils.loadOfflineSession(config.SHOP)
    const response = await Shopify.Webhooks.Registry.register({
        path: "/webhooks",
        topic: topic,
        accessToken: offlineSession.accessToken,
        shop: config.SHOP,
    })
    if (!response[topic].success) {
        console.error(response.result)
        throw new ApiError(500, `Failed to register ${topic} webhook`)
    }
}

const getWorkflows = catchAsync(async (req, res) => {
    const workflows = await Workflows.list()
    for (const workflow of workflows) {
        const fileName = Workflows.getFileNameFromTopic(workflow.topic)
        if (!files.dynamicFileExists(fileName)) continue
        workflow.fileIsValid = await files.lintDynamicFileAsync(fileName)
        const fileContent = await files.getFunctionContents(fileName)
        workflow.fileIsPublished = fileContent.trim() === workflow.code.trim()
    }
    res.status(200).send(workflows)
})

const getWorkflow = catchAsync(async (req, res) => {
    const { topic } = req.params
    const workflow = await Workflows.findByTopic(topic)
    const fileName = Workflows.getFileNameFromTopic(workflow.topic)
    if (files.dynamicFileExists(fileName)) {
        workflow.fileIsValid = await files.lintDynamicFileAsync(fileName)
        const fileContent = await files.getFunctionContents(fileName)
        workflow.fileIsPublished = fileContent.trim() === workflow.code.trim()
    }
    res.status(200).send(workflow)
})

const createWorkflow = catchAsync(async (req, res) => {
    const data = await Workflows.create(req.body)
    res.status(200).send(data)
})

const updateWorkflow = catchAsync(async (req, res) => {
    const data = await Workflows.update(req.params.topic, req.body)
    res.status(200).send(data)
})

const publishWorkflow = catchAsync(async (req, res) => {
    const workflow = await Workflows.findByTopic(req.params.topic)
    await Workflows.update(workflow.topic, { published: true })
    await createTopicHandler(workflow.topic, workflow.code)
    res.status(200).send({ result: "success" })
})

const unpublishWorkflow = catchAsync(async (req, res) => {
    const workflow = await Workflows.findByTopic(req.params.topic)
    await Workflows.update(workflow.topic, { published: false })
    await cleanupTopicHandler(req.params.topic)
    res.status(200).send({ result: "success" })
})

const deleteWorkflow = catchAsync(async (req, res) => {
    const workflow = await Workflows.findByTopic(req.params.topic)
    if (workflow.published) {
        await cleanupTopicHandler(req.params.topic)
    }
    await Workflows.delete(req.params.topic)
    res.status(200).send({ result: "success" })
})

const apiController = {
    getWorkflows,
    createWorkflow,
    updateWorkflow,
    publishWorkflow,
    unpublishWorkflow,
    deleteWorkflow,
    getWorkflow,
}

export default apiController
