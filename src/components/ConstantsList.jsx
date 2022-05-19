import {
    Button,
    TextStyle,
    Banner,
    Stack,
    ResourceList,
    ResourceItem,
    FormLayout,
    ButtonGroup,
    Form,
    TextField,
    Spinner,
} from "@shopify/polaris"
import useNav from "../hooks/useNav"
import useData from "../hooks/useData"
import useFetch from "../hooks/useFetch"
import WorkflowStatus from "./WorkflowStatus"
import useToast from "../hooks/useToast"
import { useState } from "react"

export default function ConstantsList() {
    const fetch = useFetch()

    const { setToast, toastHtml } = useToast()

    const { constantsLoading, constantsError, constantsMutate } = useData(
        `/api/constants`,
        {
            resourceName: "constants",
            defaultValue: [],
            onSuccess: (data) => setData([...data.constants]),
        }
    )

    const [data, setData] = useState([])
    const [saveLoading, setSaveLoading] = useState(false)
    const [formError, setFormError] = useState("")
    // const [errorStates, setErrorStates] = useState({})

    function changeConstant(item, newItem) {
        const index = data.indexOf(item)
        if (index === -1) {
            const { name = "", value = "" } = newItem
            setData([...data, { name, value }])
        } else {
            const newData = [...data]
            newData[index] = newItem
            setData(newData)
        }
    }

    async function onSave(e) {
        e.preventDefault()
        setFormError("")
        if (data.some((item) => item.name === "")) {
            return setFormError("All names must be filled")
        }

        setSaveLoading(true)
        const body = {
            constants: [...data],
        }
        const { responseData, error } = await fetch(
            `/api/constants`,
            "POST",
            body
        )
        setSaveLoading(false)
        if (error) return setFormError(error)
        console.log(responseData)
        constantsMutate([...responseData.constants])
        setData([...responseData.constants])
        setToast("Saved")
    }

    if (constantsLoading) {
        return (
            <>
                <br />
                <Stack distribution="center">
                    <Spinner
                        accessibilityLabel="Constants loading..."
                        size="small"
                    />
                </Stack>
            </>
        )
    }

    if (constantsError) {
        return (
            <>
                <Banner title="Error getting constants" status="critical">
                    <p>{constantsError}</p>
                </Banner>
                <br />
            </>
        )
    }

    const constantFields = Array.isArray(data)
        ? data
              .filter(({ name, value }) => !(name === "" && value === ""))
              .concat({ name: "", value: "" }) || []
        : []

    return (
        <>
            {toastHtml}
            {formError && (
                <>
                    <Banner title="Error" status="critical">
                        <p>{formError}</p>
                    </Banner>
                    <br />
                </>
            )}
            <Form onSubmit={onSave}>
                <FormLayout>
                    {constantFields.map((item, index) => (
                        <FormLayout.Group key={index}>
                            <TextField
                                label="Name"
                                type="text"
                                value={item.name}
                                onChange={(v) =>
                                    changeConstant(item, { ...item, name: v })
                                }
                                autoComplete="off"
                                labelHidden
                                placeholder="Name"
                                connectedRight={
                                    <TextField
                                        placeholder="Value"
                                        labelHidden
                                        label="Value"
                                        type="text"
                                        value={item.value}
                                        onChange={(v) =>
                                            changeConstant(item, {
                                                ...item,
                                                value: v,
                                            })
                                        }
                                        // onChange={handleTextFieldChange}
                                        autoComplete="off"
                                    />
                                }
                            />
                        </FormLayout.Group>
                    ))}

                    <ButtonGroup>
                        <Button
                            submit
                            primary
                            loading={saveLoading}
                            // disabled={!data.topic}
                        >
                            Save
                        </Button>
                    </ButtonGroup>
                </FormLayout>
            </Form>
        </>
    )
}
