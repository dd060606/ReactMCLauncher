const configManager = require("./configmanager")
const ipc = require("electron").ipcMain
const { shell } = require("electron")
const main = require("../../../main")
const launcherLogger = require("./logger")("%c[Launcher]", "color: #000668; font-weight: bold")
const { ping } = require("minecraft-server-ping")
const os = require("os")

exports.initMainIPC = () => {

    //Async utils
    ipc.on("open-link", (event, args) => shell.openExternal(args))
    ipc.on("ping-server", () => {
        if (configManager.getDynamicConfig()) {
            ping(configManager.getDynamicConfig().serverIP, configManager.getDynamicConfig().serverPort).then(res => main.win.webContents.send("ping-server-result", res))
                .catch(err => {
                    launcherLogger.warn("Unable to refresh server status, assuming offline.")
                    launcherLogger.debug(err)
                    main.win.webContents.send("ping-server-result", false)
                })
        }

    })
    ipc.on("set-memory", (event, args) => {
        const memory = args + "G"
        configManager.setMinRAM(memory)
        configManager.setMaxRAM(memory)
        configManager.saveConfig()
    })
    ipc.on("set-auto-auth", (event, args) => {
        configManager.setAutoAuthEnabled(args)
        configManager.saveConfig()
    })
    ipc.on("set-keep-launcher-open", (event, args) => {
        configManager.setKeepLauncherOpenEnabled(args)
        configManager.saveConfig()
    })
    ipc.on("open-game-dir", () => shell.openPath(configManager.getGameDirectory()))



    //Sync utils
    ipc.on("get-launcher-name", event => { event.returnValue = main.LAUNCHER_NAME })
    ipc.on("get-platform-name", event => { event.returnValue = process.platform })
    ipc.on("get-dynamic-config", event => { event.returnValue = configManager.getDynamicConfig() })
    ipc.on("available-memory", event => {
        const mem = os.totalmem()
        event.returnValue = (mem / 1000000000).toFixed(0) - 1
    })
    ipc.on("get-memory", event => {
        event.returnValue = parseInt(configManager.getMinRAM().replace("G", ""))
    })

    ipc.on("is-keep-launcher-open", event => { event.returnValue = configManager.isKeepLauncherOpenEnabled() })
    ipc.on("is-auto-auth", event => { event.returnValue = configManager.isAutoAuthEnabled() })



    //Frame buttons 
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
