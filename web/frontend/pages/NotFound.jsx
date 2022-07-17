import { Card, EmptyState, Page } from "@shopify/polaris"

export default function NotFound() {
    return (
        <Page>
            <Card>
                <Card.Section>
                    <EmptyState heading="There is no page at this address">
                        <p>Check the URL and try again.</p>
                    </EmptyState>
                </Card.Section>
            </Card>
        </Page>
    )
}
