const gameLogger = require('./logger')('%c[GameLogger]', 'color: #000668; font-weight: bold')
const main = require("../../../main")
const cp = require('child_process')
const { Client } = require('minecraft-launcher-core')
const ipc = require("electron").ipcMain
const path = require("path")

const ConfigManager = require("./configmanager")

exports.init = () => {
    ipc.on("play", () => play())
}

function play() {

    const launcher = new Client()
    const opts = {
        clientPackage: null,

        authorization: {
            access_token: ConfigManager.getSelectedAccount().accessToken,
            client_token: ConfigManager.getClientToken(),
            uuid: ConfigManager.getSelectedAccount().uuid,
            name: ConfigManager.getSelectedAccount().displayName

        },
        root: ConfigManager.getGameDirectory(),
        version: {
            number: "1.12.2",
            type: "release"
        },
        memory: {
            max: ConfigManager.getMaxRAM(),
            min: ConfigManager.getMinRAM()
        },
        forge: path.join(ConfigManager.getGameDirectory(), "forge-1.12.2-14.23.5.2855-installer.jar")
    }

    launcher.launch(opts)

    launcher.on('debug', (e) => console.log(e))
    launcher.on('data', (e) => console.log(e))

}

