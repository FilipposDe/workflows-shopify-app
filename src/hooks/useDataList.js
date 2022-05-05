import { useEffect, useState } from "react"

export function useDataList(fetcher, name, defaultValue) {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(defaultValue)

    async function getData() {
        setLoading(true)
        const receivedData = await fetcher()
        setLoading(false)
        if (receivedData.error) {
            setError(receivedData.error?.message || receivedData.error)
            return
        }
        setData(receivedData)
    }

    useEffect(() => {
        getData()
    }, [])

    return {
        [name]: data,
        [`${name}Loading`]: loading,
        [`${name}Error`]: error,
        [`${name}Refetch`]: getData,
    }
}

export default useDataList
