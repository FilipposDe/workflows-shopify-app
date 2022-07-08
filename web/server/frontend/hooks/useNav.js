import { useNavigate } from "react-router-dom"

function useNav() {
    const nav = useNavigate()
    return nav
}

export default useNav
