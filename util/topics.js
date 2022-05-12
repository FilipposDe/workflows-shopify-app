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

export function capUnderscoreToHuman(text) {
    let result = ""
    const words = text.split("_")
    for (const word of words) {
        const firstChar = word.charAt(0)
        result += firstChar + word.substring(1).toLowerCase() + " "
    }

    return result.trim()
}

export function removeChars(text, removeChars) {
    let result = text
    for (const char of removeChars) {
        while (text.indexOf(char) !== -1) {
            result += result.replace(char, "")
        }
    }
    return result
}
