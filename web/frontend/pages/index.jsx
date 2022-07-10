import { Card, Page, Layout, Frame } from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import useNav from "../hooks/useNav"
import WorkflowsList from "../components/WorkflowsList"
import ConstantsList from "../components/ConstantsList"

export default function HomePage() {
    const nav = useNav()

    return (
        <Frame>
            <Page fullWidth>
                <TitleBar
                    title="Workflows"
                    primaryAction={{
                        content: "New workflow",
                        onAction: () => nav("/new"),
                    }}
                />
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
