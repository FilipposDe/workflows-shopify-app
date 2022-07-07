import { useNavigate } from "react-router-dom"

export default function useNav() {
    const nav = useNavigate()
    return nav
}
