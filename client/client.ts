import config from "../util/config";
/* FiveM Typescript Boilerplate by Whitigol */
/* CLIENT SCRPIT */

RegisterCommand(
    "livecode",
    () => {
        SendNuiMessage(
            JSON.stringify({
                type: "toggle",
                state: true,
            })
        );
        SetNuiFocus(true, true);
    },
    false
);

RegisterNuiCallbackType("execute_callback");
on("__cfx_nui:execute_callback", (data: any, cb: any) => {
    const { code } = data;
    try {
        new Function(code)();
    } catch (e) {
        SendNuiMessage(
            JSON.stringify({
                type: "exec_error",
                message: e.message,
            })
        );
    }

    SetNuiFocus(false, false);
});

RegisterNuiCallbackType("execute_callback_lua");
on("__cfx_nui:execute_callback_lua", () => {
    SetNuiFocus(false, false);
});
