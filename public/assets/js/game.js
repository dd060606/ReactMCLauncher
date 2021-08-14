const gameLogger = require('./logger')('%c[GameLogger]', 'color: #000668; font-weight: bold')
const javaLogger = require('./logger')('%c[JavaLogger]', 'color: #000668; font-weight: bold')

const main = require("../../../main")
const cp = require('child_process')
const { Client } = require('minecraft-launcher-core')
const ipc = require("electron").ipcMain
const path = require("path")
const fs = require("fs")
const Axios = require("axios")
const AdmZip = require("adm-zip")


const ConfigManager = require("./configmanager")

exports.init = () => {
    ipc.on("play", () => play())
}

function setUpdateText(message) {
    main.win.webContents.send("set-update-text", message)
}
function setUpdateProgress(progress) {
    main.win.webContents.send("set-update-progress", progress)
}

function play() {



    checkJavaInstallation().then((jre = null) => {
        updateAndLaunch(jre)
    }).catch(() => {
        const jrePath = path.join(ConfigManager.getGameDirectory(), "jre")
        if (!fs.existsSync(jrePath)) {
            fs.mkdirSync(jrePath, { recursive: true })
        }

        if (process.platform === "win32") {
            downloadJava(main.JRE_WINDOWS, path.join(jrePath, "jre-windows.zip"), jrePath)
        }
        else {
            downloadJava(main.JRE_LINUX, path.join(jrePath, "jre-linux.zip"), jrePath)
        }

    })

}
function updateAndLaunch(jre = null) {
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
            number: main.MC_VERSION,
            type: "release"
        },
        memory: {
            max: ConfigManager.getMaxRAM(),
            min: ConfigManager.getMinRAM()
        },
        javaPath: jre ? path.join(jre, "bin", process.platform === "win32" ? "java.exe" : "java") : null,
        forge: main.FORGE_VERSION ? path.join(ConfigManager.getGameDirectory(), `forge-${main.MC_VERSION}-${main.FORGE_VERSION}-installer.jar`) : null
    }

    launcher.launch(opts)

    launcher.on("debug", (e) => console.log(e))
    launcher.on("data", (e) => console.log(e))
    launcher.on("progress", (progress) => {
        console.log("Progress : " + JSON.stringify(progress))
    })
    launcher.on("arguments", () => {
        setUpdateProgress(0)
        setUpdateText("LaunchingGame")
        setTimeout(() => {
            main.win.close()
        }, 10000)
    })
}
function checkJavaInstallation() {
    return new Promise((resolve, reject) => {
        setUpdateText("AnalyzingJava")
        const jrePath = path.join(ConfigManager.getGameDirectory(), "jre")
        let jreInstallationFile = path.join(jrePath, "jre-windows.zip")
        if (process.platform !== "win32") {
            jreInstallationFile = path.join(jrePath, "jre-linux.zip")
        }

        if (fs.existsSync(jreInstallationFile)) {
            fs.unlink(jreInstallationFile, (err) => {
                if (err) {
                    console.error(err)
                }
                return reject()
            })
        }

        var spawn = require("child_process").spawn("java", ["-version"])
        spawn.on("error", function (err) {
            if (fs.existsSync(jrePath) && fs.readdirSync(jrePath).length !== 0) {
                return resolve(jrePath)
            }
            else {
                javaLogger.log("No java installation found!")
                return reject()
            }

        })
        spawn.stderr.on("data", function (data) {
            if (data.toString().includes("64")) {
                data = data.toString().split("\n")[0]
                var javaVersion = new RegExp('java version').test(data) ? data.split(" ")[2].replace(/"/g, "") : false;
                if (javaVersion != false) {
                    javaLogger.log("Java " + javaVersion + " is already installed")
                    return resolve()
                } else {
                    if (fs.existsSync(jrePath) && fs.readdirSync(jrePath).length !== 0) {
                        return resolve(jrePath)
                    }
                    else {
                        javaLogger.log("No java installation found!")
                        return reject()
                    }

                }
            }
            else {
                if (fs.existsSync(jrePath) && fs.readdirSync(jrePath).length !== 0) {
                    return resolve(jrePath)
                }
                else {
                    javaLogger.log("No java installation found!")
                    return reject()
                }

            }
        })
    })
}

async function downloadJava(file_url, targetPath, jre_path) {
    try {
        const { data, headers } = await Axios({
            url: file_url,
            method: 'GET',
            responseType: 'stream'
        })
        const totalLength = headers['content-length']
        let receivedBytes = 0


        const writer = fs.createWriteStream(targetPath)

        data.on('data', (chunk) => {
            receivedBytes += chunk.length
            setUpdateText("DownloadingJava")
            setUpdateProgress((100.0 * receivedBytes / totalLength).toFixed(0))
        })
        data.pipe(writer)
        writer.on('error', err => {
            javaLogger.error(err.message)
            main.win.webContents.send("java-download-error", err.message)
        })
        data.on('end', function () {
            javaLogger.log("Java installation successfully downloaded!")
            let zip = new AdmZip(targetPath)
            javaLogger.log("Extracting java!")
            setUpdateText("ExtractingJava")
            zip.extractAllTo(jre_path, true)
            javaLogger.log("Java was successfully extracted!")
            fs.unlink(targetPath, (err) => {
                if (err) {
                    javaLogger.error(err.message)
                    return
                }
                javaLogger.log("Java installation file was successfully removed!")
            })
            updateAndLaunch(jre_path)
        })

    } catch (err) {
        javaLogger.error(err.message)
        main.win.webContents.send("java-download-error", err.message)

    }

}






