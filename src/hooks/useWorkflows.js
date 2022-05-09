import { useAppBridge } from "@shopify/app-bridge-react"
import { userLoggedInFetch } from "../App"

export const useWorkflows = () => {
    const app = useAppBridge()
    const fetch = userLoggedInFetch(app)

    async function getWorkflows() {
        const response = await fetch("/api/workflows")
        if (!response.ok) return { error: "Internal Server Error" }
        const data = await response.json()
        return data
    }

    async function createWorkflow(body) {
        const response = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (!response.ok) return { error: "Internal Server Error" }
        const data = await response.json()
        return data
    }

    async function updateWorkflow(id, body) {
        const response = await fetch(`/api/workflows/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (!response.ok) return { error: "Internal Server Error" }
        const data = await response.json()
        return data
    }

    async function publishWorkflow(id) {
        const response = await fetch(`/api/workflows/${id}/publish`, {
            method: "POST",
        })
        if (!response.ok) return { error: "Internal Server Error" }
        const data = await response.json()
        return data
    }

    async function deleteWorkflow(id) {
        const response = await fetch(`/api/workflows/${id}`, {
            method: "DELETE",
        })
        if (!response.ok) return { error: "Internal Server Error" }
        const data = await response.json()
        return data
    }

    return {
        createWorkflow,
        getWorkflows,
        updateWorkflow,
        deleteWorkflow,
        publishWorkflow
    }
}

export default useWorkflows
