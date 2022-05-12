import { useEffect, useState } from "react"
import {
    Card,
    Heading,
    TextContainer,
    DisplayText,
    TextStyle,
    Button,
    Filters,
    IndexTable,
    Badge,
    ResourceList,
    ResourceItem,
} from "@shopify/polaris"
import { Toast, useAppBridge } from "@shopify/app-bridge-react"
import { gql, useMutation } from "@apollo/client"

export function WorkflowsList(props) {
    const { workflows, workflowsLoading, onEdit } = props

    function renderItem(item) {
        const { topic, fileIsPublished } = item
        const shortcutActions = [
            {
                content: "Unpublish",
                onAction: () => {},
                monochrome: true,
                color: "black",
            },
            {
                content: "Delete",
                onAction: () => {},
                destructive: true,
                outline: true,
            },
        ]
        return (
            <ResourceItem
                id={topic}
                url={""}
                onClick={() => onEdit(item)}
                shortcutActions={shortcutActions}
            >
                <h3>
                    <TextStyle variation="strong">{topic}</TextStyle>
                </h3>
                {fileIsPublished ? (
                    <Badge status="success">Published</Badge>
                ) : (
                    <Badge status="critical">Unpublished</Badge>
                )}
            </ResourceItem>
        )
    }

    return (
        <>
            <ResourceList
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
        </>
    )
}
