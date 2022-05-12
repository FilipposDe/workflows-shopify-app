import { useParams } from "react-router-dom"

function Workflow() {
    const { topic } = useParams()
    return <div>Workflow for {topic}</div>
}

export default Workflow
