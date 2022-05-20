import { Stack, Badge } from "@shopify/polaris"

function WorkflowStatus(props) {
    const { workflow } = props
    return (
        <Stack>
            {workflow.published ? (
                workflow.lintErrors ? (
                    // <Badge status="success">Valid code</Badge>
                    <Badge status="critical">Lint errors</Badge>
                ) : null
            ) : null}
            {workflow.published ? (
                <Badge status="success">Published</Badge>
            ) : (
                <Badge status="critical">Unpublished</Badge>
            )}

            {workflow.published ? (
                workflow.outdatedFileInServer ? (
                    // <Badge status="success">Up to date</Badge>
                    <Badge status="critical">Outdated file</Badge>
                ) : null
            ) : null}
        </Stack>
    )
}

export default WorkflowStatus
