import { useToast } from "@shopify/app-bridge-react"
import {
    Button,
    Banner,
    Stack,
    FormLayout,
    ButtonGroup,
    Form,
    TextField,
    Spinner,
    Checkbox,
} from "@shopify/polaris"
import { useState } from "react"
import useData from "../hooks/useData"
import useFetch from "../hooks/useFetch"

export default function ConstantsList() {
    const fetch = useFetch()

    const { show: showToast } = useToast()

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
        const newData = data.filter(
            (item) => item.name !== "" && item.value !== ""
        )
        if (newData.some((item) => item.name === "")) {
            return setFormError("All names must be filled")
        }

        setSaveLoading(true)
        const body = {
            constants: [...newData],
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
        showToast("Saved")
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
            <style jsx="true">
                {`
                    [id^="value-encrypt"] {
                        -webkit-text-security: disc;
                    }
                `}
            </style>
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
                                        id={
                                            item.encrypt
                                                ? `value-encrypt-${item.name}`
                                                : undefined
                                        }
                                        value={item.value}
                                        onChange={(v) =>
                                            changeConstant(item, {
                                                ...item,
                                                value: v,
                                            })
                                        }
                                        autoComplete="off"
                                        connectedRight={
                                            <Checkbox
                                                label="Encrypt"
                                                checked={item.encrypt}
                                                onChange={(v) =>
                                                    changeConstant(item, {
                                                        ...item,
                                                        encrypt: v,
                                                    })
                                                }
                                            />
                                        }
                                    />
                                }
                            />
                        </FormLayout.Group>
                    ))}

                    <ButtonGroup>
                        <Button submit primary loading={saveLoading}>
                            Save
                        </Button>
                    </ButtonGroup>
                </FormLayout>
            </Form>
        </>
    )
}
