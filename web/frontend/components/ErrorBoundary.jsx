import { Component } from "react"

const COMMON_TYPES = {
    "APP::ERROR::INVALID_CONFIG": "Info: APP::ERROR::INVALID_CONFIG",
}

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
        return COMMON_TYPES[error.type] || ""
    }

    render() {
        if (this.state.error) {
            return (
                <div>
                    <h1
                        style={{
                            fontSize: "16px",
                            textAlign: "center",
                            marginTop: "40px",
                            display: "block",
                        }}
                    >
                        Something went wrong.
                        <small
                            style={{
                                marginTop: "30px",
                                display: "block",
                            }}
                        >
                            {this.getMessage(this.state.error)}
                        </small>
                    </h1>
                </div>
            )
        }

        return this.props.children
    }
}
