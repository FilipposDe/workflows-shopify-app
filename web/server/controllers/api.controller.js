import { encrypt, decrypt } from "../helpers/crypt.js"

import shopifyService from "../services/shopify.service.js"
import files from "../services/dynamicFiles.service.js"
import dbService from "../services/db.service.js"
import config from "../config.js"
import ApiError from "../helpers/ApiError.js"
import logger from "../logger.js"
import catchAsync from "../helpers/catchAsync.js"
import dynamicFilesService from "../services/dynamicFiles.service.js"
import { WEBHOOK_TOPICS } from "../../common/topic-list.js"
const { Shopify } = shopifyService
const { Workflows, Settings } = dbService

function listTopicWebhooksQuery(topic) {
    return `{
        webhookSubscriptions (first: 250, topics: [${topic}]) {
            edges {
                node {
                    id
                }
            }
        }
    }`
}

async function cleanupTopicHandler(topic) {
    // 1. Delete the webhook from Shopify
    const offlineSession = await Shopify.Utils.loadOfflineSession(config.SHOP)
    const clientG = shopifyService.createApiClient(offlineSession.accessToken)
    const allTopicWebhooksQuery = listTopicWebhooksQuery(topic)
    const result = await clientG.query({ data: allTopicWebhooksQuery })
    if (!result?.body?.data?.webhookSubscriptions?.edges?.length) {
        console.log(result?.body)
        // TODO it's okay if there's none, not okay if there are errors
        throw new ApiError(404, "Could not find this webhook on Shopify")
    }
    const ids = result.body.data.webhookSubscriptions.edges.map(
        (edge) => edge.node.id
    )
    const clientR = shopifyService.createApiClient(
        offlineSession.accessToken,
        false
    )
    for await (const id of ids) {
        await clientR.delete({
            path: `webhooks/${id.replace(
                "gid://shopify/WebhookSubscription/",
                ""
            )}`,
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
        logger.error(error)
    }
}

async function createTopicHandler(topic, code) {
    // 1. Make sure the file is written
    const fileName = Workflows.getFileNameFromTopic(topic)
    files.addFile(fileName, code)
    // 2. Get handler (function object) by importing file
    const handlerFn = await files.dynamicallyImportFile(fileName)
    if (handlerFn === null) {
        throw new ApiError(500, `Failed to dynamically import file`)
    }
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
        logger.error(response.result)
        throw new ApiError(500, `Failed to register ${topic} webhook`)
    }
}

async function getStatus(workflow) {
    const status = {}
    const fileName = Workflows.getFileNameFromTopic(workflow.topic)
    if (!files.dynamicFileExists(fileName)) return {}
    try {
        await files.lintDynamicFileAsync(fileName)
    } catch (error) {
        status.lintErrors = true
    }
    const fileContent = await files.getFunctionContents(fileName)
    if (fileContent.trim() !== workflow.code.trim()) {
        status.outdatedFileInServer = true
    }
    const h = shopifyService.getHandler(workflow.topic)
    console.log({ h })

    return status
}

const getWorkflows = catchAsync(async (req, res) => {
    const workflows = await Workflows.list()
    const result = []
    for (const workflow of workflows) {
        const status = await getStatus(workflow)
        result.push({ ...workflow, ...status })
    }
    res.status(200).send(result)
})

const getWorkflow = catchAsync(async (req, res) => {
    const { topic } = req.params
    const workflow = await Workflows.findByTopic(topic)
    const status = await getStatus(workflow)
    const result = { ...workflow, ...status }
    res.status(200).send(result)
})

const createWorkflow = catchAsync(async (req, res) => {
    const data = await Workflows.create(req.body)
    res.status(200).send(data)
})

const updateWorkflow = catchAsync(async (req, res) => {
    const workflow = await Workflows.update(req.params.topic, req.body)
    if (workflow.published) {
        await createTopicHandler(workflow.topic, workflow.code)
    }
    const status = await getStatus(workflow)
    const result = { ...workflow, ...status }
    res.status(200).send(result)
})

const publishWorkflow = catchAsync(async (req, res) => {
    const workflow = await Workflows.findByTopic(req.params.topic)
    await createTopicHandler(workflow.topic, workflow.code)
    const updatedWorkflow = await Workflows.update(workflow.topic, {
        published: true,
    })
    const status = await getStatus(updatedWorkflow)
    const result = { ...updatedWorkflow, ...status }
    res.status(200).send(result)
})

const unpublishWorkflow = catchAsync(async (req, res) => {
    const workflow = await Workflows.findByTopic(req.params.topic)
    await cleanupTopicHandler(req.params.topic)
    const updatedWorkflow = await Workflows.update(workflow.topic, {
        published: false,
    })
    const status = await getStatus(updatedWorkflow)
    const result = { ...updatedWorkflow, ...status }
    res.status(200).send(result)
})

const deleteWorkflow = catchAsync(async (req, res) => {
    const workflow = await Workflows.findByTopic(req.params.topic)
    if (workflow.published) {
        await cleanupTopicHandler(req.params.topic)
    }
    await Workflows.delete(req.params.topic)
    res.status(200).send({ result: "success" })
})

const getConstants = catchAsync(async (req, res) => {
    const constantsStr = await Settings.get("constants")
    const constants = JSON.parse(constantsStr) || []
    for (const item of constants) {
        if (!item.encrypt) continue
        item.value = decrypt(item.value)
    }
    res.status(200).send({ constants })
})

const updateConstants = catchAsync(async (req, res) => {
    const constantsBody = req.body.constants
    for (const item of constantsBody) {
        if (!item.encrypt) continue
        item.value = encrypt(item.value)
    }
    const constantsStr = JSON.stringify(constantsBody)
    const constantsNewStr = await Settings.put("constants", constantsStr)
    const newConstants = JSON.parse(constantsNewStr) || []
    await dynamicFilesService.setConstants() // TODO decrypt
    for (const item of newConstants) {
        if (!item.encrypt) continue
        item.value = decrypt(item.value)
    }
    res.status(200).send({ constants: newConstants })
})

const getTopics = catchAsync(async (req, res) => {
    const result = WEBHOOK_TOPICS.filter((item) =>
        item.scopes.split(",").some((scope) => config.SCOPES.includes(scope))
    )
    res.status(200).send(result)
})

const apiController = {
    getWorkflows,
    createWorkflow,
    updateWorkflow,
    publishWorkflow,
    unpublishWorkflow,
    deleteWorkflow,
    getWorkflow,
    getConstants,
    updateConstants,
    getTopics,
}

export default apiController
