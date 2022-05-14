import { Stack, Badge } from "@shopify/polaris"

function WorkflowStatus(props) {
    const { workflow } = props
    return (
        <Stack>
            {workflow.published ? (
                workflow.fileIsValid ? (
                    <Badge status="success">Valid code</Badge>
                ) : (
                    <Badge status="critical">Invalid code</Badge>
                )
            ) : null}
            {workflow.published ? (
                <Badge status="success">Published</Badge>
            ) : (
                <Badge status="critical">Unpublished</Badge>
            )}

            {workflow.published ? (
                workflow.fileIsPublished ? (
                    <Badge status="success">Up to date</Badge>
                ) : (
                    <Badge status="critical">Outdated file</Badge>
                )
            ) : null}
        </Stack>
    )
}

export default WorkflowStatus
