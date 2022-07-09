import { Component } from "react"

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error) {
        return { error }
    }

    componentDidCatch(_error, _errorInfo) {
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
                <div>
                    <br />
                    <br />
                    <h1
                        style={{
                            fontSize: "16px",
                            textAlign: "center",
                        }}
                    >
                        Something went wrong.
                        <br />
                        <br />
                        <small>{this.getMessage(this.state.error)}</small>
                    </h1>
                </div>
            )
        }

        return this.props.children
    }
}
