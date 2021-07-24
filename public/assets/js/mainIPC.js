const configManager = require("./configmanager")
const ipc = require("electron").ipcMain
const main = require("../../../main")

exports.initMainIPC = () => {

    //Sync utils
    ipc.on("get-launcher-name", (event) => { event.returnValue = configManager.launcherName })
    ipc.on("get-platform-name", (event) => { event.returnValue = process.platform })


    //Async app actions

    //Frame buttons actions
    ipc.on("close-app", () => {
        main.win.close()
    })
    ipc.on("minimize-app", () => {
        main.win.minimize()
    })
    ipc.on("maximize-app", () => {

        if (main.win.isMaximized()) {
            main.win.unmaximize()
        } else {
            main.win.maximize()
        }
    })



}
