const { app, BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")
const isDev = require("electron-is-dev")
const electronLocalshortcut = require("electron-localshortcut")

const mainIPC = require("./public/assets/js/mainIPC")
const ConfigManager = require('./public/assets/js/configmanager')
const login = require("./public/assets/js/login")
const game = require("./public/assets/js/game")




let win


function createWindow() {

    win = new BrowserWindow({
        width: 1280,
        height: 729,
        frame: false,
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
    ConfigManager.loadDynamicConfig()
    setInterval(function () { ConfigManager.loadDynamicConfig() }, 15000)
    createWindow()
    mainIPC.initMainIPC()
    login.init()
    game.init()
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


exports.SERVER_IP = "mc.hypixel.net"
exports.SERVER_PORT = "25565"
exports.LAUNCHER_CONFIG = "https://dd06-dev.fr/dl/studycorp/launchers/launcher_config.json"
exports.LAUNCHER_NAME = "ReactMCLauncher"
exports.MC_VERSION = "1.12.2"
exports.FORGE_VERSION = "14.23.5.2855"
exports.JRE_WINDOWS = "https://dd06-dev.fr/dl/jre/jre-windows.zip"
exports.JRE_LINUX = "https://dd06-dev.fr/dl/jre/jre-linux.zip"
exports.MODS_URL = "https://dd06-dev.fr/dl/react-mc-launcher/mods.json"