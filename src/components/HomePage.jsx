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

import { ProductsCard } from "./ProductsCard"
import { WorkflowsList } from "./WorkflowsList"
import { webhookTopics } from "./../../server/constants.js"
import { capUnderscoreToCamelCase } from "../../util/topics"
import useNav from "../hooks/useNav"

// const initialData = {
//     id: null,
//     topic: "PRODUCTS_CREATE",
//     code: "console.log({data})",
// }

export function HomePage() {
    // const [data, setData] = useState(initialData)
    // const [saveLoading, setSaveLoading] = useState(false)
    // const [deleteLoading, setDeleteLoading] = useState(false)
    // const [publishLoading, setPublishLoading] = useState(false)
    // const [formError, setFormError] = useState("")
    // const [mode, setMode] = useState("CREATE")

    // const {
    //     getWorkflows,
    //     createWorkflow,
    //     updateWorkflow,
    //     deleteWorkflow,
    //     publishWorkflow,
    // } = useWorkflows()

    // console.log({ workflows, workflowsLoading, workflowsError })

    const nav = useNav()

    // const saveWorkflow = async () => {
    //     setFormError("")

    //     setSaveLoading(true)
    //     const body = {
    //         topic: data.topic,
    //         code: data.code,
    //     }
    //     let responseData
    //     if (mode === "CREATE") {
    //         responseData = await createWorkflow(body)
    //     } else {
    //         responseData = await updateWorkflow(data.topic, body)
    //     }
    //     setSaveLoading(false)
    //     if (responseData.error) return setFormError(responseData.error)

    //     setData(initialData)
    //     workflowsRefetch()
    // }

    // const populateNewWorkflow = () => {
    //     setData(initialData)
    //     setMode("CREATE")
    // }

    // const editWorkflow = (item) => {
    //     setData({
    //         topic: item.topic,
    //         code: item.code,
    //     })
    //     setMode("EDIT")
    // }

    // const deleteCurrentWorkflow = async () => {
    //     setFormError("")
    //     setDeleteLoading(true)
    //     const responseData = await deleteWorkflow(data.topic)
    //     setDeleteLoading(false)
    //     if (responseData.error) return setFormError(responseData.error)
    //     setData(initialData)
    //     workflowsRefetch()
    // }

    // const publishCurrentWorkflow = async () => {
    //     setFormError("")
    //     setPublishLoading(true)
    //     const responseData = await publishWorkflow(data.topic)
    //     setPublishLoading(false)
    //     if (responseData.error) return setFormError(responseData.error)
    //     workflowsRefetch()
    // }

    // const usedTopics = workflows?.map((item) => item.topic) || []
    // const availableTopics = webhookTopics.filter(
    //     (item) => !usedTopics.includes(item)
    // )

    return (
        <Frame>
            <Page
                title="Workflows"
                fullWidth
                primaryAction={{
                    content: "New workflow",
                    onAction: () => nav("/new"),
                }}
            >
                <Layout>
                    {/* <Layout.Section>
                        <Card
                            sectioned
                            title={
                                mode === "EDIT"
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
                                            {mode === "EDIT" ? (
                                                <Select
                                                    label="Topic"
                                                    options={[data.topic]}
                                                    onChange={(v) => {}}
                                                    value={data.topic}
                                                    disabled
                                                />
                                            ) : (
                                                <Select
                                                    label="Topic"
                                                    options={availableTopics}
                                                    onChange={(v) =>
                                                        setData({
                                                            ...data,
                                                            topic: v,
                                                        })
                                                    }
                                                    value={data.topic}
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
                                                data.topic
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
                                                Save
                                            </Button>
                                            {mode === "EDIT" && (
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
                                            
                                        </ButtonGroup>
                                    </FormLayout>
                                </Form>
                            )}
                        </Card>
                    </Layout.Section> */}
                    <Layout.Section oneHalf>
                        <Card sectioned title="All workflows">
                            <WorkflowsList />
                        </Card>
                    </Layout.Section>
                    <Layout.Section oneHalf></Layout.Section>
                </Layout>
                <br />
            </Page>
        </Frame>
    )
}
