export function capUnderscoreToCamelCase(text) {
    let result = ""
    const words = text.split("_")
    let i = 0
    for (const word of words) {
        const firstChar = word.charAt(0)
        result +=
            (i === 0 ? firstChar.toLowerCase() : firstChar) +
            word.substring(1).toLowerCase()
        i++
    }

    return result
}
