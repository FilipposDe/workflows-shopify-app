const FROM_APP = [
    `
declare class Constants {\
    static get(key:string):string\
    static remove(key:string):string\
}\
`,
]

const LIB_SOURCES = {
    FROM_APP,
}

export default LIB_SOURCES

// GraphqlClient
// RestClient
// Common
// Secrets
// Constants
