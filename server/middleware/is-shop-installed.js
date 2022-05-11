export default function isShopInstalled() {
    return (req, res, next) => {
        const isInstalled = req.app.get("is-shop-installed")
        if (!isInstalled) {
            const currParams = new URLSearchParams(req.query).toString()
            res.redirect(`/auth?${currParams}`)
        } else {
            next()
        }
    }
}
