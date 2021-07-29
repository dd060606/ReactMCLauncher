
const loggerLogin = require('./logger')('%c[Login]', 'color: #000668; font-weight: bold')
const ipc = require("electron").ipcMain
const main = require("../../../main")
const AuthManager = require("./authmanager")
const { BrowserWindow, nativeImage } = require("electron")
const axios = require("axios")




exports.initAuthIPC = () => {
    ipc.on("mojang-login", (event, args) => mojangLogin(args.username, args.password))
    ipc.on("microsoft-login", (event, args) => AuthManager.addMicrosoftAccount())

}


function mojangLogin(username, password) {
    AuthManager.addAccount(username, password).then((value) => {
        setTimeout(() => {
            main.win.webContents.send("auth-success")
        }, 1000)
    }).catch((err) => {
        main.win.webContents.send("mojang-auth-err", err);
        loggerLogin.log('Error while logging in.', err)
    })
}