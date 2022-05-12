import { DEBUG_MSG } from "../helpers/constants.js"

export default function isShopInstalled() {
    return (req, res, next) => {
        const isInstalled = req.app.get("is-shop-installed")
        if (!isInstalled) {
            console.log(DEBUG_MSG.SHOP_NOT_INSTALLED)
            const currParams = new URLSearchParams(req.query).toString()
            res.redirect(`/auth/install?${currParams}`)
        } else {
            next()
        }
    }
}
