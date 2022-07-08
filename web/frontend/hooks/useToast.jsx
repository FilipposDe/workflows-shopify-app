import { Toast } from "@shopify/polaris"
import { useState } from "react"

export default function useToast() {
    const [text, setText] = useState("")
    const [isError, setIsError] = useState(false)

    function setToast(text, isError = false) {
        setText(text)
        setIsError(isError)
    }

    const toastHtml = !!text && (
        <Toast
            content={text}
            error={isError}
            onDismiss={() => setToast(null)}
        />
    )

    return {
        setToast,
        toastHtml,
    }
}
