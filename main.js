const { app, BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")
const isDev = require("electron-is-dev")
const electronLocalshortcut = require("electron-localshortcut")

const ipc = require("electron").ipcMain

const mainIPC = require("./public/assets/js/mainIPC")
const ConfigManager = require('./public/assets/js/configmanager')
const login = require("./public/assets/js/login")
const game = require("./public/assets/js/game")
const { autoUpdater } = require("electron-updater")

const log = require("electron-log")
log.transports.file.level = "debug"
autoUpdater.logger = log




let win


function createWindow() {


    win = new BrowserWindow({
        width: 1280,
        height: 729,
        frame: false,
        opacity: 0,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        },
        title: exports.LAUNCHER_NAME,
        icon: path.join(__dirname, "public", "assets", "images", "logo.png")
    })



    win.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "./build/index.html")}`
    )
    electronLocalshortcut.register(win, "CommandOrControl+Shift+I", () => {
        if (!win.webContents.isDevToolsOpened()) {
            win.webContents.openDevTools()
        }
        else {
            win.webContents.closeDevTools()
        }
    })

    if (!isDev) {
        win.removeMenu()
    }

    win.on("closed", () => {
        win = null
    })

    exports.win = win




}


app.whenReady().then(() => {
    // Load ConfigManager
    ConfigManager.load()
    createWindow()
    ConfigManager.loadDynamicConfig()
    setInterval(function () { ConfigManager.loadDynamicConfig() }, 15000)
    mainIPC.initMainIPC()
    login.init()
    game.init()
    console.log("Launcher version: " + app.getVersion())
    setTimeout(() => {
        win.setOpacity(1)
    }, 1500)



})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipc.on("install-updates", () => {
    autoUpdater.quitAndInstall()
})
ipc.on("check-auto-update", () => {

    if (isDev) {
        autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
        win.webContents.send("launcher-update-finished", false)
        return
    }

    if (process.platform === 'darwin') {
        autoUpdater.autoDownload = false
    }
    autoUpdater.allowPrerelease = true

    autoUpdater.on('update-downloaded', () => {
        win.webContents.send("launcher-update-finished", true)

    })
    autoUpdater.on("update-available", () => {
        if (process.platform === "darwin") {
            main.win.webContents.send("update-available-mac")
        }
    })
    autoUpdater.on('update-not-available', () => {
        win.webContents.send("launcher-update-finished", false)
    })
    autoUpdater.on('error', (err) => {
        win.webContents.send("launcher-update-error", err)
    })
    autoUpdater.on('download-progress', (progress) => {
        win.webContents.send("set-launcher-update-progress", progress.percent.toFixed(2))
    })
    autoUpdater.checkForUpdates().catch(err => {
        win.webContents.send("launcher-update-error", err)
    })


})


exports.LAUNCHER_CONFIG = "https://dd06-dev.fr/dl/launchers/react-mc-launcher/launcher_config.json"
exports.LAUNCHER_NAME = "ReactMCLauncher"
exports.MC_VERSION = "1.12.2"
exports.FORGE_VERSION = "14.23.5.2855"
exports.JRE_WINDOWS = "https://dd06-dev.fr/dl/jre/jre-windows.zip"
exports.JRE_LINUX = "https://dd06-dev.fr/dl/jre/jre-linux.zip"
exports.MODS_URL = "https://dd06-dev.fr/dl/react-mc-launcher/mods.json"