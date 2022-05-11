import express from "express"
import { capUnderscoreToCamelCase } from "../util/topics.js"
import catchAsync from "./helpers/catchAsync.js"
import ApiError from "./helpers/ApiError.js"
import { Workflows } from "./services/db.service.js"
// TODO continue work

import {
    getAllFiles,
    getFunctionContents,
    publishFile,
    validateDynamicFileAsync,
} from "./services/dynamicFiles.service.js"

const apiRoutes = express.Router()

apiRoutes.get(
    "/workflows",
    catchAsync(async (req, res) => {
        const workflows = await Workflows.list()
        for (const workflow of workflows) {
            const fileName =
                capUnderscoreToCamelCase(workflow.webhookTopic) + ".js"
            workflow.fileIsValid = await validateDynamicFileAsync(fileName)
            const fileContent = await getFunctionContents(fileName)
            workflow.fileIsPublished =
                fileContent.trim() === workflow.code.trim()
        }
        res.status(200).send(workflows)
    })
)

apiRoutes.post(
    "/workflows",
    catchAsync(async (req, res) => {
        const data = await Workflows.create(req.body)
        res.status(200).send(data)
    })
)

apiRoutes.patch(
    "/workflows/:id",
    catchAsync(async (req, res) => {
        const data = await Workflows.update(req.params.id, req.body)
        res.status(200).send(data)
    })
)

apiRoutes.post(
    "/workflows/:id/publish",
    catchAsync(async (req, res) => {
        const workflow = await Workflows.findById(req.params.id)
        const fileName = Workflows.getFileNameFromTopic(workflow.webhookTopic)
        const isPublished = await publishFile(fileName, workflow.code)
        if (isPublished) {
            res.status(200).send({ result: "success" })
        } else {
            throw new ApiError(400, "Unable to publish file")
        }
    })
)

apiRoutes.delete(
    "/workflows/:id",
    catchAsync(async (req, res) => {
        await Workflows.delete(req.params.id)
        res.status(200).send({})
    })
)

export default apiRoutes
