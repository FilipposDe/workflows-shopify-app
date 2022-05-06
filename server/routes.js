import express from "express"
import catchAsync from "./helpers/catchAsync.js"
import { Workflows } from "./services/db.service.js"

const apiRoutes = express.Router()

apiRoutes.get(
    "/workflows",
    catchAsync(async (req, res) => {
        const result = await Workflows.list()
        res.status(200).send(result)
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

apiRoutes.delete(
    "/workflows/:id",
    catchAsync(async (req, res) => {
        await Workflows.delete(req.params.id)
        res.status(200).send({})
    })
)

export default apiRoutes
