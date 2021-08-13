const configManager = require("./configmanager")
const ipc = require("electron").ipcMain
const { shell } = require("electron")
const main = require("../../../main")
const launcherLogger = require("./logger")("%c[Launcher]", "color: #000668; font-weight: bold")
const { ping } = require("minecraft-server-ping")

exports.initMainIPC = () => {

    //Async utils
    ipc.on("open-link", (event, args) => shell.openExternal(args))
    ipc.on("ping-server", () => {

        ping(configManager.getDynamicConfig().serverIP, configManager.getDynamicConfig().serverPort).then(res => main.win.webContents.send("ping-server-result", res))
            .catch(err => {
                launcherLogger.warn("Unable to refresh server status, assuming offline.")
                launcherLogger.debug(err)
                main.win.webContents.send("ping-server-result", false)
            })
    })

    //Sync utils
    ipc.on("get-launcher-name", event => { event.returnValue = main.LAUNCHER_NAME })
    ipc.on("get-platform-name", event => { event.returnValue = process.platform })
    ipc.on("get-dynamic-config", event => { event.returnValue = configManager.getDynamicConfig() })


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
