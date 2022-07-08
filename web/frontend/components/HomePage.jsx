import { Card, Page, Layout, Frame } from "@shopify/polaris"
import useNav from "../hooks/useNav"
import ConstantsList from "./ConstantsList"
import WorkflowsList from "./WorkflowsList"

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
                    <Layout.Section oneHalf>
                        <Card sectioned title="Constants">
                            <ConstantsList />
                        </Card>
                    </Layout.Section>
                </Layout>
                <br />
            </Page>
        </Frame>
    )
}
