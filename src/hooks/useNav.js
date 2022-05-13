import { useAppBridge } from "@shopify/app-bridge-react"
import { useNavigate } from "react-router-dom"
import { Redirect } from "@shopify/app-bridge/actions"

export default function useNav() {
    const nav = useNavigate()
    // const app = useAppBridge()
    // const redirect = Redirect.create(app)

    // function nav(url) {
    //     redirect.dispatch(Redirect.Action.APP, url)
    // }

    return nav
}
