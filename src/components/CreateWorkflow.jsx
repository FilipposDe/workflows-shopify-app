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
import useData from "../hooks/useData"
import React, { Suspense, useEffect, useState } from "react"
import useFetch from "../hooks/useFetch"
import useNav from "../hooks/useNav"
// import CodeEditor from "./CodeEditor"
import { WEBHOOK_TOPICS } from "../../common/topic-list"
import CodeEditor from "./CodeEditor"
import getDefaultCode from "../helpers/defaultCode"

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
    const availableTopics = WEBHOOK_TOPICS.filter(
        (item) => !usedTopics.includes(item)
    )

    const error = workflowsError || formError

    return (
        <Frame>
            <Page
                title="Create workflow"
                fullWidth
                primaryAction={{
                    content: "Save",
                    disabled: !data.topic,
                    loading: saveLoading,
                    onAction: () => saveWorkflow(),
                }}
                breadcrumbs={[
                    { content: "Workflows", onAction: () => nav("/") },
                ]}
            >
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

                            {workflowsLoading && (
                                <Stack distribution="center">
                                    <Spinner
                                        accessibilityLabel="Workflows loading..."
                                        size="large"
                                    />
                                </Stack>
                            )}

                            {!workflowsLoading && (
                                <Form onSubmit={() => saveWorkflow()}>
                                    <FormLayout>
                                        <FormLayout.Group condensed>
                                            <Select
                                                label="Topic"
                                                options={[
                                                    "",
                                                    ...availableTopics,
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
