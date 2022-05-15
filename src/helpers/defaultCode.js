import { capUnderscoreToCamelCase } from "../../util/topics"

export default function getDefaultCode(topic) {
    return `import { Shopify } from '%40shopify/shopify-api' // %40: temp. bug fix

export default async function ${capUnderscoreToCamelCase(topic)}(data) {
    // Your code here
}
`
}
