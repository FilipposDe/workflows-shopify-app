import Editor from "@monaco-editor/react"
import { Spinner, Stack } from "@shopify/polaris"
import { capUnderscoreToCamelCase } from "../../util/topics"
import LIB_SOURCES from "../helpers/editorTypes"

function addTypes(monaco) {
    // extra libraries
    // var libSource = [
    //     "declare class Facts {",
    //     "    /**",
    //     "     * Returns the next fact",
    //     "     */",
    //     "    static anext():string",
    //     "}",
    // ].join("\n")

    LIB_SOURCES.forEach((source, index) => {
        const libUri = `ts:filename/${index}.d.ts`
        // const libUri = "ts:filename/fil.d.ts"
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            source,
            libUri
        )
    })
}

function CodeEditor(props) {
    const { value, onChange, presets } = props

    return (
        <div
            style={{
                padding: "5px",
                border: "1px solid rgb(237 238 239)",
            }}
        >
            <code
                style={{
                    fontSize: "14px",
                }}
            >{`export default async function ${capUnderscoreToCamelCase(
                presets.topic
            )}(data) {`}</code>
            <Editor
                beforeMount={addTypes}
                height="40vh"
                language="javascript"
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
            <code
                style={{
                    fontSize: "14px",
                }}
            >{`}`}</code>
        </div>
    )
}

export default CodeEditor
