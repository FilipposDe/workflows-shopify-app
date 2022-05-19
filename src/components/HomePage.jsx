import { Card, Page, Layout, Frame } from "@shopify/polaris"

import WorkflowsList from "./WorkflowsList"
import useNav from "../hooks/useNav"
import ConstantsList from "./ConstantsList"

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
                            {/* <SecretsList /> */}
                        </Card>
                    </Layout.Section>
                </Layout>
                <br />
            </Page>
        </Frame>
    )
}
