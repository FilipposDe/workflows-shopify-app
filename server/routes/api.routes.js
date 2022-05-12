import express from "express"
import apiController from "../controllers/api.controller.js"

const apiRoutes = express.Router()

apiRoutes.get("/workflows", apiController.getWorkflows)

apiRoutes.post("/workflows", apiController.createWorkflow)

apiRoutes.patch("/workflows/:topic", apiController.updateWorkflow)

apiRoutes.post("/workflows/:topic/publish", apiController.publishWorkflow)

apiRoutes.post("/workflows/:topic/unpublish", apiController.unpublishWorkflow)

apiRoutes.delete("/workflows/:topic", apiController.deleteWorkflow)

export default apiRoutes
