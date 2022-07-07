export default function cspHeaders() {
    return (req, res, next) => {
        const queryShop = req.query.shop
        const IS_EMBEDDED = true
        if (IS_EMBEDDED && queryShop) {
            res.setHeader(
                "Content-Security-Policy",
                `frame-ancestors https://${queryShop} https://admin.shopify.com;`
            )
        } else {
            res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`)
        }
        next()
    }
}
