import { useEffect, useState } from "react"
import {
    Card,
    Heading,
    TextContainer,
    DisplayText,
    TextStyle,
    Button,
    Filters,
    IndexTable,
} from "@shopify/polaris"
import { Toast, useAppBridge } from "@shopify/app-bridge-react"
import { gql, useMutation } from "@apollo/client"

export function WorkflowsList(props) {
    const { workflows, workflowsLoading, onEdit } = props

    const [query, setQuery] = useState("")

    const [selected, setSelected] = useState([])

    const bulkActions = [
        {
            content: "Delete",
            onAction: () => console.log("Todo: implement bulk delete"),
        },
    ]

    return (
        <>
            {/* <div style={{ padding: "16px", display: "flex" }}>
                <div style={{ flex: 1 }}>
                    <Filters
                        queryValue={query}
                        onQueryChange={setQuery}
                        onQueryClear={() => setQuery("")}
                    />
                </div>
            </div> */}
            <IndexTable
                selectable={false}
                // resourceName={"Workflow"}
                itemCount={workflows.length}
                // selectedItemsCount={
                //     selected.length === workflows.length
                //         ? "All"
                //         : selected.length
                // }
                // onSelectionChange={() => {}}
                condensed
                loading={workflowsLoading}
                // bulkActions={bulkActions}
                headings={[{ title: "Title" }, { fileName: "File name" }]}
            >
                {workflows.map((item, index) => (
                    <IndexTable.Row
                        id={item.title}
                        key={index}
                        selected={selected.includes(item.title)}
                        position={index}
                    >
                        <div
                            style={{ padding: ".75rem 1rem" }}
                            onClick={() => onEdit(item)}
                        >
                            <p>
                                <TextStyle variation="strong">
                                    {item.title}
                                </TextStyle>
                            </p>
                            <p>{item.fileName}</p>
                        </div>
                    </IndexTable.Row>
                ))}
            </IndexTable>
        </>
    )
}
