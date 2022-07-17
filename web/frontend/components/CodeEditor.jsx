import { Spinner, Stack } from "@shopify/polaris"
import { Suspense, lazy } from "react"
const Editor = lazy(() => import("@monaco-editor/react"))

async function addAutoTypes(editor, monaco) {
    const { AutoTypings } = await import("monaco-editor-auto-typings")
    await AutoTypings.create(editor, {
        monaco,
        preloadPackages: true,
        versions: {
            "@shopify/shopify-api": "3.0.1",
        },
    })
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
            <Suspense fallback={<div></div>}>
                <Editor
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
        </div>
    )
}

export default CodeEditor
