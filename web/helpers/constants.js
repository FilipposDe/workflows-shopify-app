export const DEBUG_MSG = {
    BEGIN_OFFLINE_AUTH: "Debug: ...Ok. Begin initial (offline) auth...",
    OK_AUTH_REDIR_SHOPIFY: "Debug: ...Ok. Redirecting to Shopify...",
    VALIDATING_CB: "Debug: Validating callback from Shopify...",
    STORING_IS_INSTALLED: "Debug: (offline callback) Saving isInstalled...",
    REGISTERING_W_HOOKS: "Debug: Registering all webhooks...",
    FINISHED_REDIR_TO_ONLINE: "Debug: Redirecting to online auth flow...",
    CHECKING_TOP_COOKIE: "Debug: Checking top level cookie...",
    NO_TOP_COOKIE:
        "Debug: No top level cookie, redirecting to /auth/toplevel...",
    BEGIN_ONLINE_AUTH: "Debug: ...Ok. Begin online auth...",
    SENDING_TOP_LVL_DOC: "Debug: Sending top level redirect doc...",
    FINISHED_REDIR_TO_APP: "Debug: Redirecting to / (app) with ?shop...",
    SHOP_NOT_INSTALLED: "Debug: Shop is not installed, redirecting to /install",
}
