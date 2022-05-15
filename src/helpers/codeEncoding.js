export function codeEncode(code) {
    let result = code
    result = code.replace(/(import.*from\s*['"])%40(.*['"])/g, "$1@$2")
    return result
}

export function codeDecode(code) {
    let result = code
    result = code.replace(/(import.*from\s*['"])@(.*['"])/g, "$1%40$2")
    return result
}
