import { Card, Page, Layout, Frame } from "@shopify/polaris"

import { WorkflowsList } from "./WorkflowsList"
import useNav from "../hooks/useNav"

export function HomePage() {
    const nav = useNav()

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
