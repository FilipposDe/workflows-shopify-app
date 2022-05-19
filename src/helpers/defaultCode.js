import { capUnderscoreToCamelCase } from "../../util/topics"

export default function getDefaultCode(topic) {
    return `import { Shopify } from '%40shopify/shopify-api' // %40: temp. bug fix
import { getConstant } from '../util/util.js'

export default async function ${capUnderscoreToCamelCase(topic)}(data) {
    // Your code here
}
`
}
