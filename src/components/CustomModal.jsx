import { Modal, Stack, TextStyle } from "@shopify/polaris"

function CustomModal(props) {
    const {
        confirmation,
        destructive,
        confirmLoading,
        onConfirm,
        small,
        isOpen,
        setIsOpen,
        title,
        primaryAction,
        secondaryActions,
        text,
    } = props

    // return null

    return (
        <Modal
            small={small || confirmation}
            //   activator={props.activatorEl}
            open={isOpen}
            onClose={() => setIsOpen(false)}
            title={title || ""}
            primaryAction={
                confirmation
                    ? {
                          content: "OK",
                          onAction: onConfirm,
                          loading: confirmLoading,
                          destructive: destructive,
                      }
                    : primaryAction || {}
            }
            secondaryActions={
                confirmation
                    ? [
                          {
                              content: "Cancel",
                              onAction: () => setIsOpen(false),
                          },
                      ]
                    : secondaryActions || []
            }
        >
            <Modal.Section>
                <Stack vertical>
                    <TextStyle>
                        {confirm ? "Are you sure?" : text || ""}
                    </TextStyle>
                </Stack>
            </Modal.Section>
        </Modal>
    )
}

export default CustomModal
