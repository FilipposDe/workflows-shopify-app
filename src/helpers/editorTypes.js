const LIB_SOURCES = [
    `
declare class Constants {\
    static get(key:string):string\
    static remove(key:string):string\
}\
`,
    `\
declare const RestClient:any\
`,
]

export default LIB_SOURCES
