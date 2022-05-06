export function capHyphToCamelCase(text) {
    let result = ""
    const words = text.split("_")
    for (const word of words) {
        const firstChar = word.charAt(0)
        result += firstChar.toUpperCase() + word.substring(1)
    }

    return result
}

export function capHyphToHuman(text) {
    let result = ""
    const words = text.split("_")
    for (const word of words) {
        const firstChar = word.charAt(0)
        result += firstChar.toUpperCase() + word.substring(1) + " "
    }

    return result.trim()
}
