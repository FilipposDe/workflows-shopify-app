import {
    Button,
    TextStyle,
    Banner,
    Stack,
    ResourceList,
    ResourceItem,
} from "@shopify/polaris"
import useNav from "../hooks/useNav"
import useData from "../hooks/useData"
import useFetch from "../hooks/useFetch"
import WorkflowStatus from "./WorkflowStatus"
import useToast from "../hooks/useToast"
import { useState } from "react"

export default function WorkflowsList() {
    const nav = useNav()
    const fetch = useFetch()

    const { setToast, toastHtml } = useToast()

    const [loadingStates, setLoadingStates] = useState({})
    // const [errorStates, setErrorStates] = useState({})

    const { workflows, workflowsLoading, workflowsError, workflowsRefetch } =
        useData(`/api/workflows`, {
            resourceName: "workflows",
            defaultValue: [],
        })

    const togglePublishWorkflow = async (workflow) => {
        setLoadingStates({ ...loadingStates, publish: true })
        const { error } = await fetch(
            `/api/workflows/${workflow.topic}/${
                workflow.published ? "unpublish" : "publish"
            }`,
            "POST"
        )
        setLoadingStates({ ...loadingStates, publish: false })
        if (error) return setToast(error, true)
        setToast(workflow.published ? "Unpublished" : "Published")
        workflowsRefetch()
    }

    if (workflowsError) {
        return (
            <>
                <Banner title="Error getting workflows" status="critical">
                    <p>{workflowsError}</p>
                </Banner>
                <br />
            </>
        )
    }

    const renderItem = (item) => {
        const { topic, published } = item
        const shortcutActions = [
            {
                content: published ? "Unpublish" : "Publish",
                onAction: () => togglePublishWorkflow(item),
                monochrome: true,
                loading: loadingStates.publish,
            },
        ]
        return (
            <ResourceItem
                id={topic}
                onClick={() => nav(`/${item.topic}`)}
                shortcutActions={shortcutActions}
            >
                <h3>
                    <TextStyle variation="strong">{topic}</TextStyle>
                </h3>
                <WorkflowStatus workflow={item} />
            </ResourceItem>
        )
    }

    const emptyState = (
        <Stack alignment="center">
            <TextStyle>Start by creating a new workflow</TextStyle>
            <Button primary onClick={() => nav("/new")}>
                Create
            </Button>
        </Stack>
    )

    return (
        <>
            {toastHtml}
            <ResourceList
                emptyState={emptyState}
                resourceName={{
                    singular: "workflow",
                    plural: "workflows",
                }}
                loading={workflowsLoading}
                items={workflows}
                selectable={false}
                renderItem={renderItem}
            />
        </>
    )
}
