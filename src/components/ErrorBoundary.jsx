import React from "react"
import { Link } from "react-router-dom"

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error) {
        return { error }
    }

    componentDidCatch(error, errorInfo) {
        // logErrorToMyService(error, errorInfo)
    }

    getMessage(error) {
        let result = ""
        if (error?.type === "APP::ERROR::INVALID_CONFIG") {
            result += "Info: APP::ERROR::INVALID_CONFIG"
        }
        return result
    }

    render() {
        if (this.state.error) {
            return (
                <center>
                    <br />
                    <br />
                    <h1 style={{ maxWidth: "300px", fontSize: "16px" }}>
                        Something went wrong.
                        <br />
                        {/* Go back <Link to="/">Home</Link> */}
                        <br />
                        <small>{this.getMessage(this.state.error)}</small>
                    </h1>
                </center>
            )
        }

        return this.props.children
    }
}
