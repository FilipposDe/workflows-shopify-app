module.exports = {
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    extends: [
        "../../.eslintrc.cjs",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "prettier",
    ],
    ignorePatterns: ["dist/*"],
    settings: {
        react: {
            version: "^17.0.2",
        },
    },
    overrides: [
        {
            files: ["*.jsx"],
        },
    ],
    rules: {
        "react/prop-types": "off",
    },
}
