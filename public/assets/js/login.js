
const loggerLogin = require('./logger')('%c[Login]', 'color: #000668; font-weight: bold')
const ipc = require("electron").ipcMain
const main = require("../../../main")
const AuthManager = require("./authmanager")
const ConfigManager = require("./configmanager")
const { BrowserWindow, nativeImage } = require("electron")
const axios = require("axios")




exports.init = () => {
    ipc.on("mojang-login", (event, args) => mojangLogin(args.username, args.password, args.rememberMe))
    ipc.on("microsoft-login", () => AuthManager.addMicrosoftAccount())
    ipc.on("auto-auth", async () => {
        const selectedAcc = ConfigManager.getSelectedAccount()
        if (selectedAcc != null) {
            const val = await AuthManager.validateSelected()
            if (!val) {
                ConfigManager.removeAuthAccount(selectedAcc.uuid)
                ConfigManager.save()
                loggerLogin.error("Failed to refresh login!")
                main.win.webContents.send("auto-auth-response", false)
            } else {
                loggerLogin.log("Sucessfully authenticated!")
                main.win.webContents.send("auto-auth-response", true)
            }
        } else {
            loggerLogin.log("Sucessfully authenticated!")
            main.win.webContents.send("auto-auth-response", true)

        }
    })

    ipc.on("get-player-name", event => { event.returnValue = ConfigManager.getSelectedAccount().displayName })
    ipc.on("get-player-uuid", event => { event.returnValue = ConfigManager.getSelectedAccount().uuid })



}


function mojangLogin(username, password, autoAuth) {
    AuthManager.addAccount(username, password, autoAuth).then((value) => {
        setTimeout(() => {
            main.win.webContents.send("auth-success")
        }, 1000)
    }).catch((err) => {
        main.win.webContents.send("mojang-auth-err", err)
        loggerLogin.log('Error while logging in.', err)
    })
}