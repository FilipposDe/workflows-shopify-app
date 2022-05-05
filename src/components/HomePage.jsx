import Editor from "@monaco-editor/react"
import { useAppBridge } from "@shopify/app-bridge-react"
import {
    Card,
    ButtonGroup,
    Page,
    Layout,
    TextContainer,
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
} from "@shopify/polaris"
import { useState } from "react"
import { userLoggedInFetch } from "../App"

import trophyImgUrl from "../assets/home-trophy.png"
import useDataList from "../hooks/useDataList"
import useWorkflows from "../hooks/useWorkflows"

import { ProductsCard } from "./ProductsCard"
import { WorkflowsList } from "./WorkflowsList"

export function HomePage() {
    const [data, setData] = useState({
        id: null,
        title: "",
        fileName: "",
        code: "",
    })
    const [saveLoading, setSaveLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [formError, setFormError] = useState("")

    const { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } =
        useWorkflows()

    const { workflows, workflowsLoading, workflowsError, workflowsRefetch } =
        useDataList(getWorkflows, "workflows", [])

    const saveWorkflow = async () => {
        setFormError("")
        setSaveLoading(true)
        const body = {
            title: data.title,
            fileName: data.fileName,
            code: data.code,
        }
        let responseData
        if (!data.id) {
            responseData = await createWorkflow(body)
        } else {
            responseData = await updateWorkflow(data.id, body)
        }
        setSaveLoading(false)
        if (responseData.error) return setFormError(responseData.error)

        setData({ id: null, title: "", fileName: "", code: "" })
        workflowsRefetch()
    }

    const populateNewWorkflow = () => {
        setData({ id: null, title: "", fileName: "", code: "" })
    }

    const editWorkflow = (item) => {
        setData({
            id: item.id,
            title: item.title,
            fileName: item.fileName,
            code: item.code,
        })
    }

    const deleteCurrentWorkflow = async () => {
        setFormError("")
        setDeleteLoading(true)
        const responseData = await deleteWorkflow(data.id)
        setDeleteLoading(false)
        if (responseData.error) return setFormError(responseData.error)
        setData({ id: null, title: "", fileName: "", code: "" })
        workflowsRefetch()
    }

    return (
        <Frame>
            <Page fullWidth>
                <Layout>
                    <Layout.Section>
                        <Card
                            sectioned
                            title={
                                data.id
                                    ? "Edit workflow"
                                    : "Create new workflow"
                            }
                        >
                            <Form onSubmit={() => saveWorkflow()}>
                                <FormLayout>
                                    <TextField
                                        value={data.title}
                                        onChange={(v) =>
                                            setData({
                                                ...data,
                                                title: v,
                                            })
                                        }
                                        label="Title"
                                        type="text"
                                    />
                                    <TextField
                                        value={data.fileName}
                                        onChange={(v) =>
                                            setData({
                                                ...data,
                                                fileName: v,
                                            })
                                        }
                                        label="File name"
                                        type="text"
                                    />

                                    <Editor
                                        height="40vh"
                                        language="javascript"
                                        value={data.code || ""}
                                        onChange={(v) =>
                                            setData({ ...data, code: v })
                                        }
                                        loading={
                                            <Stack distribution="center">
                                                <Spinner />
                                            </Stack>
                                        }
                                        options={{
                                            minimap: { enabled: false },
                                        }}
                                    />

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
                                        >
                                            Submit
                                        </Button>
                                        {!!data.id && (
                                            <Button
                                                outline
                                                primary
                                                loading={saveLoading}
                                            >
                                                Publish
                                            </Button>
                                        )}
                                        {!!data.id && (
                                            <Button
                                                destructive
                                                onClick={deleteCurrentWorkflow}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </ButtonGroup>
                                </FormLayout>
                            </Form>
                        </Card>
                    </Layout.Section>
                    <Layout.Section secondary>
                        <Card
                            sectioned
                            title="Workflows"
                            actions={[
                                {
                                    content: "New",
                                    onAction: () => populateNewWorkflow(),
                                },
                            ]}
                        >
                            {workflowsError && (
                                <Banner
                                    title="Error getting workflows"
                                    status="critical"
                                >
                                    <p>{workflowsError}</p>
                                </Banner>
                            )}
                            {workflowsLoading && (
                                <Stack distribution="center">
                                    <Spinner
                                        accessibilityLabel="Workflows loading..."
                                        size="large"
                                    />
                                </Stack>
                            )}
                            {workflows && !workflowsLoading && (
                                <WorkflowsList
                                    workflows={workflows}
                                    workflowsLoading={workflowsLoading}
                                    onEdit={editWorkflow}
                                />
                            )}

                            {/*  */}
                            {/*  */}
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </Frame>
    )
}
