
const { app, BrowserWindow } = require("electron")
const path = require("path")
const fs = require("fs")
const isDev = require("electron-is-dev")
const electronLocalshortcut = require("electron-localshortcut")

const mainIPC = require("./public/assets/js/mainIPC")



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
        title: LAUNCHER_NAME,
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

    mainIPC.initMainIPC()
    exports.win = win
}


app.whenReady().then(createWindow)

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

exports.LAUNCHER_NAME = LAUNCHER_NAME
