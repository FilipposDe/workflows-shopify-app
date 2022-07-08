import { useEffect, useState } from "react"
import useFetch from "./useFetch"

export function useData(
    url,
    { resourceName = "data", onSuccess = () => {}, defaultValue = null }
) {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(defaultValue)
    const fetch = useFetch()

    async function getData() {
        setLoading(true)
        const { responseData, error } = await fetch(url)
        setLoading(false)
        if (error) {
            setError(error?.message || error)
            return
        }
        setData(responseData)
        onSuccess(responseData)
    }

    useEffect(() => {
        getData()
    }, [])

    function mutate(newData) {
        setData(newData)
    }

    return {
        [resourceName]: data,
        [`${resourceName}Loading`]: loading,
        [`${resourceName}Error`]: error,
        [`${resourceName}Refetch`]: getData,
        [`${resourceName}Mutate`]: mutate,
    }
}

export default useData
