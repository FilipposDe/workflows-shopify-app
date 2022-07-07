// import Editor from "@monaco-editor/react"
import { Spinner, Stack } from "@shopify/polaris"
import { capUnderscoreToCamelCase } from "../../util/topics"
import LIB_SOURCES from "../helpers/editorTypes"
// import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings"
import React, { Suspense } from "react"
const Editor = React.lazy(() => import("@monaco-editor/react"))

async function addAutoTypes(editor, monaco) {
    // monaco.languages.typescript.typescriptDefaults.addExtraLib(
    //     `declare class Constants {\
    //     static get(key:string):string\
    // }\
    // `,
    //     "ts:filename/constants.d.ts"
    // )

    const { AutoTypings } = await import("monaco-editor-auto-typings")
    await AutoTypings.create(editor, {
        monaco,
        preloadPackages: true,
        versions: {
            "@shopify/shopify-api": "3.0.1",
            // "%40shopify/shopify-api": "3.0.1",
        },
        // sourceCache: new LocalStorageCache(), // Cache loaded sources in localStorage. May be omitted
        // Other options...
        // Log progress updates to a div console
        // onUpdate: (u, t) => {
        //     console.log(t)
        // },

        // // Log errors to a div console
        // onError: (e) => {
        //     console.log(e)
        // },
    })
    // compiler options
    // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    // noResolve: true,
    // target: monaco.languages.typescript.ScriptTarget.ES2016,
    // allowNonTsExtensions: true,
    // moduleResolution:
    //     monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    // module: monaco.languages.typescript.ModuleKind.CommonJS,
    // noEmit: true,
    // typeRoots: ["node_modules/@types"],
    // })
    // LIB_SOURCES.FROM_APP.forEach((source, index) => {
    //     const libUri = `ts:filename/${index}.d.ts`
    //     // const libUri = "ts:filename/fil.d.ts"
    //     monaco.languages.typescript.javascriptDefaults.addExtraLib(
    //         source,
    //         libUri
    //     )
    // })
}

function CodeEditor(props) {
    const { value, onChange } = props

    return (
        <div
            style={{
                padding: "5px",
                border: "1px solid rgb(237 238 239)",
            }}
        >
            {/* <code
                style={{
                    fontSize: "14px",
                }}
            >{`export default async function ${capUnderscoreToCamelCase(
                presets.topic
            )}(data) {`}</code> */}

            <Suspense fallback={<div></div>}>
                <Editor
                    // beforeMount={addTypes}
                    onMount={addAutoTypes}
                    height="40vh"
                    language="typescript"
                    value={value}
                    onChange={onChange}
                    loading={
                        <Stack distribution="center">
                            <Spinner />
                        </Stack>
                    }
                    options={{
                        minimap: { enabled: false },
                        contextmenu: false,
                        overviewRulerLanes: 0,
                        lineNumbers: "off",
                    }}
                />
            </Suspense>

            {/* <code
                style={{
                    fontSize: "14px",
                }}
            >{`}`}</code> */}
        </div>
    )
}

export default CodeEditor
