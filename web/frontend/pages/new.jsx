import {
    Card,
    ButtonGroup,
    Page,
    Layout,
    Select,
    Stack,
    Form,
    Button,
    FormLayout,
    Frame,
    Banner,
    Spinner,
} from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import { useEffect, useState } from "react"
import useData from "../hooks/useData"
import useFetch from "../hooks/useFetch"
import useNav from "../hooks/useNav"
import CodeEditor from "../components/CodeEditor"
import getDefaultCode from "../helpers/defaultCode"
//

export default function CreateWorkflow() {
    const [data, setData] = useState({ topic: "", code: "" })
    const [saveLoading, setSaveLoading] = useState(false)
    const [formError, setFormError] = useState("")
    const nav = useNav()

    const { workflows, workflowsLoading, workflowsError } = useData(
        `/api/workflows`,
        {
            resourceName: "workflows",
            defaultValue: [],
        }
    )

    const { topics, topicsLoading, topicsError } = useData(`/api/topics`, {
        resourceName: "topics",
        defaultValue: [],
    })

    const fetch = useFetch()

    useEffect(() => {
        if (data.topic && !data.code) {
            setData({ ...data, code: getDefaultCode(data.topic) })
        }
    }, [data.topic])

    const saveWorkflow = async () => {
        setFormError("")
        setSaveLoading(true)
        const body = {
            topic: data.topic,
            code: data.code,
            published: false,
        }
        const { error } = await fetch(`/api/workflows`, "POST", body)
        setSaveLoading(false)
        if (error) return setFormError(error)
        nav("/")
    }

    function onReset(e) {
        e.preventDefault()
        if (!data.topic) return
        setData({ ...data, code: getDefaultCode(data.topic) })
    }

    const usedTopics = workflows?.map((item) => item.topic) || []
    const availableTopics = topics.filter(
        (item) => !usedTopics.includes(item.name)
    )

    const error = workflowsError || formError || topicsError

    return (
        <Frame>
            <Page>
                <TitleBar
                    title="Create workflow"
                    primaryAction={{
                        content: "Save",
                        disabled: !data.topic,
                        loading: saveLoading,
                        onAction: () => saveWorkflow(),
                    }}
                    breadcrumbs={[
                        { content: "Workflows", onAction: () => nav("/") },
                    ]}
                />
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            {error && (
                                <>
                                    <Banner
                                        title="There was an error creating this workflow"
                                        status="critical"
                                    >
                                        <p>{error}</p>
                                    </Banner>
                                    <br />
                                </>
                            )}

                            {workflowsLoading ||
                                (topicsLoading && (
                                    <Stack distribution="center">
                                        <Spinner
                                            accessibilityLabel="Workflows loading..."
                                            size="large"
                                        />
                                    </Stack>
                                ))}

                            {!workflowsLoading && !topicsLoading && (
                                <Form onSubmit={() => saveWorkflow()}>
                                    <FormLayout>
                                        <FormLayout.Group condensed>
                                            <Select
                                                label="Topic"
                                                options={[
                                                    "",
                                                    ...availableTopics.map(
                                                        (item) => item.name
                                                    ),
                                                ]}
                                                onChange={(v) =>
                                                    setData({
                                                        ...data,
                                                        topic: v,
                                                    })
                                                }
                                                value={data.topic}
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
                                                presets={{ topic: data.topic }}
                                            />
                                        )}

                                        <ButtonGroup>
                                            <Button
                                                submit
                                                primary
                                                loading={saveLoading}
                                                disabled={!data.topic}
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
                                        </ButtonGroup>
                                    </FormLayout>
                                </Form>
                            )}
                        </Card>
                    </Layout.Section>
                </Layout>
                <br />
            </Page>
        </Frame>
    )
}
