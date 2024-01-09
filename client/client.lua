RegisterNUICallback("execute_callback_lua", function(data, cb)
    local success, err = pcall(function()
        load(data.code)()
    end)

    if not success then
        SendNUIMessage({
            type = "exec_error",
            message = err
        })
    end
end)
