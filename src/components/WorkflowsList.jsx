import { useEffect, useState } from "react"
import {
    Button,
    Heading,
    TextContainer,
    DisplayText,
    TextStyle,
    Spinner,
    Banner,
    Stack,
    Badge,
    ResourceList,
    ResourceItem,
} from "@shopify/polaris"
import { Toast, useAppBridge } from "@shopify/app-bridge-react"
import { gql, useMutation } from "@apollo/client"
import useNav from "../hooks/useNav"
import useData from "../hooks/useData"
import useFetch from "../hooks/useFetch"

export function WorkflowsList(props) {
    const nav = useNav()
    const fetch = useFetch()

    const { workflows, workflowsLoading, workflowsError, workflowsRefetch } =
        useData(`/api/workflows`, {
            resourceName: "workflows",
            defaultValue: [],
        })

    const publishWorkflow = async (workflow) => {
        // setFormError("")
        // setPublishLoading(true)
        const { error } = await fetch(
            `/api/workflows/${workflow.topic}/publish`,
            "POST"
        )
        // setPublishLoading(false)
        // if (error) return setFormError(error)
        workflowsRefetch()
    }

    function renderItem(item) {
        const { topic, fileIsPublished, fileIsValid, published } = item
        const shortcutActions = [
            {
                content: published ? "Unpublish" : "Publish",
                onAction: () => publishWorkflow(item),
                monochrome: true,
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
                <Stack>
                    {fileIsValid ? (
                        <Badge status="success">Valid code</Badge>
                    ) : (
                        <Badge status="critical">Invalid code</Badge>
                    )}
                    {published ? (
                        <Badge status="success">Published</Badge>
                    ) : (
                        <Badge status="critical">Unpublished</Badge>
                    )}
                    {fileIsPublished ? (
                        <Badge status="success">Up to date</Badge>
                    ) : (
                        <Badge status="critical">Outdated file</Badge>
                    )}
                </Stack>
            </ResourceItem>
        )
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

    // if (workflowsLoading)  {
    //     return (
    //         <Stack distribution="center">
    //             <Spinner
    //                 accessibilityLabel="Workflows loading..."
    //                 size="large"
    //             />
    //         </Stack>
    //     )
    // }

    const emptyState = (
        <Stack alignment="center">
            <TextStyle>Start by creating a new workflow</TextStyle>
            <Button primary onClick={() => nav("/new")}>
                Create
            </Button>
        </Stack>
    )

    return (
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
            // filterControl={filterControl}
        />
    )
}
