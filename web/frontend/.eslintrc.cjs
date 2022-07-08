module.exports = {
    env: {
        es2021: true,
        browser: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "prettier",
    ],
    rules: {
        "no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "react/react-in-jsx-scope": "off",
    },
    ignorePatterns: ["dist/*"],
    settings: {
        react: {
            version: "^17.0.2",
        },
    },
}
