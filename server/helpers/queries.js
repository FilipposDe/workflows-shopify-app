export function listTopicWebhooksQuery(topic) {
    return `{
        webhookSubscriptions (first: 250, topics: ["${topic}"]) {
            edges {
                node {
                    id
                }
            }
        }
    }`
}
