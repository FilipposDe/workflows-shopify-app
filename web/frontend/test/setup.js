import "@shopify/react-testing/matchers"

import "vi-fetch/setup"
import { mockFetch } from "vi-fetch"

// eslint-disable-next-line no-undef
beforeEach(() => {
    mockFetch.clearAll()
})
