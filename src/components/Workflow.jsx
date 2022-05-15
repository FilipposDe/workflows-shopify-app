import { useParams } from "react-router-dom"
import {
    Card,
    ButtonGroup,
    Page,
    Layout,
    Select,
    Image,
    Stack,
    Link,
    Heading,
    Form,
    TextField,
    Button,
    FormLayout,
    OptionList,
    Frame,
    Loading,
    Banner,
    Spinner,
    Filters,
    Badge,
} from "@shopify/polaris"
import useData from "../hooks/useData"
import { capUnderscoreToCamelCase } from "../../util/topics"
import Editor from "@monaco-editor/react"
import React, { Suspense, useState } from "react"
import useFetch from "../hooks/useFetch"
import useNav from "../hooks/useNav"
// import CodeEditor from "./CodeEditor"
import CustomModal from "./CustomModal"
import WorkflowStatus from "./WorkflowStatus"
import useToast from "../hooks/useToast"
import { codeDecode, codeEncode } from "../helpers/codeEncoding"
import CodeEditor from "./CodeEditor"
import getDefaultCode from "../helpers/defaultCode"

function Workflow() {
    const { topic } = useParams()

    const [data, setData] = useState({})
    const [formError, setFormError] = useState("")
    const [saveLoading, setSaveLoading] = useState(false)
    const [publishLoading, setPublishLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const fetch = useFetch()
    const nav = useNav()

    const { setToast, toastHtml } = useToast()

    const [loadingStates, setLoadingStates] = useState({})

    // const [deleteLoading, setDeleteLoading] = useState(false)
    // const [publishLoading, setPublishLoading] = useState(false)

    const { workflow, workflowLoading, workflowError, workflowMutate } =
        useData(`/api/workflows/${topic}`, {
            resourceName: "workflow",
            onSuccess: (item) =>
                setData({ ...item, code: codeDecode(item.code) }),
        })

    // useEffect(() => {}, [third])

    const saveWorkflow = async (e) => {
        e?.preventDefault()

        setFormError("")
        setSaveLoading(true)
        const body = {
            topic: data.topic,
            code: codeEncode(data.code),
        }
        const { responseData, error } = await fetch(
            `/api/workflows/${topic}`,
            "PATCH",
            body
        )
        setSaveLoading(false)
        if (error) return setFormError(error)
        workflowMutate({ ...responseData })
        setData({ ...responseData, code: codeDecode(responseData.code) })
    }

    async function deleteWorkflow() {
        setFormError("")
        setDeleteLoading(true)
        const { error } = await fetch(`/api/workflows/${topic}`, "DELETE")
        setDeleteLoading(false)
        setIsDeleteModalOpen(false)
        if (error) return setFormError(error)
        nav("/")
    }

    const togglePublishWorkflow = async () => {
        setLoadingStates({ ...loadingStates, publish: true })
        const { responseData, error } = await fetch(
            `/api/workflows/${workflow.topic}/${
                workflow.published ? "unpublish" : "publish"
            }`,
            "POST"
        )
        setLoadingStates({ ...loadingStates, publish: false })
        if (error) return setToast(error, true)
        setToast(workflow.published ? "Unpublished" : "Published")
        workflowMutate({ ...responseData })
        setData({ ...responseData, code: codeDecode(responseData.code) })
    }

    function onReset(e) {
        e.preventDefault()
        if (!data.topic) return
        setData({ ...data, code: getDefaultCode(data.topic) })
    }

    if (workflowLoading) {
        return (
            <>
                <br />
                <Stack distribution="center">
                    <Spinner
                        accessibilityLabel="Workflows loading..."
                        size="large"
                    />
                </Stack>
            </>
        )
    }

    if (workflowError) {
        return (
            <Banner
                title="There was an error loading this workflow"
                action={{ content: "Go back", url: "/" }}
                status="critical"
            >
                <p>{workflowError}</p>
            </Banner>
        )
    }

    return (
        <Frame>
            {toastHtml}
            <Page
                title={workflow?.topic}
                fullWidth
                primaryAction={{
                    content: "Save",
                    disabled: !data.topic,
                    loading: saveLoading,
                    onAction: () => saveWorkflow(),
                }}
                secondaryActions={[
                    {
                        content: "Delete",
                        destructive: true,
                        onAction: () => setIsDeleteModalOpen(true),
                        outline: true,
                    },
                    {
                        content: workflow?.published ? "Unpublish" : "Publish",
                        onAction: () => togglePublishWorkflow(),
                        loading: loadingStates.publish,
                    },
                ]}
                breadcrumbs={[
                    { content: "Workflows", onAction: () => nav("/") },
                ]}
                titleMetadata={
                    workflow ? <WorkflowStatus workflow={workflow} /> : null
                }
            >
                <Layout>
                    <Layout.Section>
                        <Card sectioned title={`Edit workflow for ${topic}`}>
                            {!!formError && (
                                <Banner status="critical">
                                    <p>{workflowError}</p>
                                </Banner>
                            )}

                            {workflow && data.topic && (
                                <Form onSubmit={() => saveWorkflow()}>
                                    <FormLayout>
                                        <FormLayout.Group>
                                            <Select
                                                label="Topic"
                                                options={[data.topic]}
                                                onChange={(v) => {}}
                                                value={data.topic}
                                                disabled
                                            />
                                        </FormLayout.Group>

                                        {!!data.topic && (
                                            <CodeEditor
                                                onChange={(v) =>
                                                    setData({
                                                        ...data,
                                                        code: v,
                                                    })
                                                }
                                                value={data.code}
                                                presets={{
                                                    topic: data.topic,
                                                }}
                                            />
                                        )}

                                        {formError && (
                                            <Banner
                                                title="Error saving"
                                                status="critical"
                                            >
                                                <p>{formError}</p>
                                            </Banner>
                                        )}

                                        <ButtonGroup>
                                            <Button
                                                submit
                                                primary
                                                loading={saveLoading}
                                                onClick={saveWorkflow}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={onReset}
                                                outline
                                                disabled={!data.topic}
                                            >
                                                Reset
                                            </Button>
                                            {/* <Button
                                                outline
                                                loading={publishLoading}
                                                onClick={publishCurrentWorkflow}
                                            >
                                                Publish
                                            </Button> */}
                                        </ButtonGroup>
                                    </FormLayout>
                                </Form>
                            )}
                        </Card>
                    </Layout.Section>
                </Layout>
                <br />
            </Page>
            <CustomModal
                confirmation
                destructive
                onConfirm={deleteWorkflow}
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                confirmLoading={deleteLoading}
            />
        </Frame>
    )
}

export default Workflow
