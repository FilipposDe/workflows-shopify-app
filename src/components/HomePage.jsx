import Editor from "@monaco-editor/react"
import { useAppBridge } from "@shopify/app-bridge-react"
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
} from "@shopify/polaris"
import { useState } from "react"
import { userLoggedInFetch } from "../App"

import trophyImgUrl from "../assets/home-trophy.png"
import useDataList from "../hooks/useDataList"
import useWorkflows from "../hooks/useWorkflows"

import { ProductsCard } from "./ProductsCard"
import { WorkflowsList } from "./WorkflowsList"
import { webhookTopics } from "./../../server/constants.js"
import { capUnderscoreToCamelCase } from "../../util/topics"

const initialData = {
    id: null,
    webhookTopic: "PRODUCTS_CREATE",
    code: "console.log({data})",
}

export function HomePage() {
    const [data, setData] = useState(initialData)
    const [saveLoading, setSaveLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [publishLoading, setPublishLoading] = useState(false)
    const [formError, setFormError] = useState("")

    const {
        getWorkflows,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        publishWorkflow,
    } = useWorkflows()

    const { workflows, workflowsLoading, workflowsError, workflowsRefetch } =
        useDataList(getWorkflows, "workflows", [])

    const saveWorkflow = async () => {
        setFormError("")

        setSaveLoading(true)
        const body = {
            webhookTopic: data.webhookTopic,
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

        setData(initialData)
        workflowsRefetch()
    }

    const populateNewWorkflow = () => {
        setData(initialData)
    }

    const editWorkflow = (item) => {
        setData({
            id: item.id,
            webhookTopic: item.webhookTopic,
            code: item.code,
        })
    }

    const deleteCurrentWorkflow = async () => {
        setFormError("")
        setDeleteLoading(true)
        const responseData = await deleteWorkflow(data.id)
        setDeleteLoading(false)
        if (responseData.error) return setFormError(responseData.error)
        setData(initialData)
        workflowsRefetch()
    }

    const publishCurrentWorkflow = async () => {
        setFormError("")
        setPublishLoading(true)
        const responseData = await publishWorkflow(data.id)
        setPublishLoading(false)
        if (responseData.error) return setFormError(responseData.error)
        workflowsRefetch()
    }

    const usedTopics = workflows.map((item) => item.webhookTopic)
    const availableTopics = webhookTopics.filter(
        (item) => !usedTopics.includes(item)
    )

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
                            {workflowsLoading ? (
                                <Stack distribution="center">
                                    <Spinner
                                        accessibilityLabel="Workflows loading..."
                                        size="large"
                                    />
                                </Stack>
                            ) : (
                                <Form onSubmit={() => saveWorkflow()}>
                                    <FormLayout>
                                        <FormLayout.Group>
                                            {data.id ? (
                                                <Select
                                                    label="Topic"
                                                    options={[
                                                        data.webhookTopic,
                                                    ]}
                                                    onChange={(v) => {}}
                                                    value={data.webhookTopic}
                                                    disabled
                                                />
                                            ) : (
                                                <Select
                                                    label="Topic"
                                                    options={availableTopics}
                                                    onChange={(v) =>
                                                        setData({
                                                            ...data,
                                                            webhookTopic: v,
                                                        })
                                                    }
                                                    value={data.webhookTopic}
                                                />
                                            )}
                                        </FormLayout.Group>

                                        <div
                                            style={{
                                                padding: "5px",
                                                border: "1px solid rgb(237 238 239)",
                                            }}
                                        >
                                            <code
                                                style={{
                                                    fontSize: "14px",
                                                }}
                                            >{`export default async function ${capUnderscoreToCamelCase(
                                                data.webhookTopic
                                            )}(data) {`}</code>
                                            <Editor
                                                height="40vh"
                                                language="javascript"
                                                value={data.code || ""}
                                                onChange={(v) =>
                                                    setData({
                                                        ...data,
                                                        code: v,
                                                    })
                                                }
                                                loading={
                                                    <Stack distribution="center">
                                                        <Spinner />
                                                    </Stack>
                                                }
                                                options={{
                                                    minimap: { enabled: false },
                                                    contextmenu: false,
                                                    overviewRulerLanes: 0,
                                                    lineNumbers: "off",
                                                }}
                                            />
                                            <code
                                                style={{
                                                    fontSize: "14px",
                                                }}
                                            >{`}`}</code>
                                        </div>

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
                                                    loading={publishLoading}
                                                    onClick={
                                                        publishCurrentWorkflow
                                                    }
                                                >
                                                    Publish
                                                </Button>
                                            )}
                                            {!!data.id && (
                                                <Button
                                                    destructive
                                                    loading={deleteLoading}
                                                    onClick={
                                                        deleteCurrentWorkflow
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </ButtonGroup>
                                    </FormLayout>
                                </Form>
                            )}
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
