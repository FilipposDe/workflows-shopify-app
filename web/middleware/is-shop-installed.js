import { DEBUG_MSG } from "../helpers/constants.js"

export default function isShopInstalled() {
    return (req, res, next) => {
        const isInstalled = req.app.get("is-shop-installed")
        if (!isInstalled) {
            const { shop } = req.query
            console.log(DEBUG_MSG.SHOP_NOT_INSTALLED)
            if (!shop) return res.status(500).send("Missing shop param")
            res.redirect(`/auth/install?shop=${shop}`)
        } else {
            next()
        }
    }
}
