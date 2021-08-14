import { Component } from "react"
import { withTranslation } from 'react-i18next'
import "../i18n"
import "./css/Updater.css"
import { LinearProgress } from "@material-ui/core"
import Swal from "sweetalert2"

class Updater extends Component {

    state = {
        progress: 0,
        updateText: ""
    }

    componentDidMount() {
        const { t } = this.props
        this.setState({ updateText: t("update.searching-updates") + "..." })
        window.ipc.receive("set-update-text", (text) => {
            const { progress } = this.state
            switch (text) {
                case "DownloadingJava":
                    this.setState({ updateText: t("update.downloading-java") + "... (" + progress + "%)" })
                    break
                case "AnalyzingJava":
                    this.setState({ updateText: t("update.analyzing-java") + "..." })
                    break
                case "ExtractingJava":
                    this.setState({ updateText: t("update.extracting-java") + "..." })
                    break
                case "LaunchingGame":
                    this.setState({ updateText: t("update.launching-game") + "..." })
                    break
                case "DownloadingForge":
                    this.setState({ updateText: t("update.downloading-forge") + "... (" + progress + "%)" })
                    break
                case "DownloadingAssets":
                    this.setState({ updateText: t("update.downloading-assets") + "... (" + progress + "%)" })
                    break
                case "DownloadingNatives":
                    this.setState({ updateText: t("update.downloading-natives") + "... (" + progress + "%)" })
                    break
                case "DownloadingLibraries":
                    this.setState({ updateText: t("update.downloading-libraries") + "... (" + progress + "%)" })
                    break
                default:
                    this.setState({ updateText: t("update.searching-updates") + "..." })
                    break
            }

        })
        window.ipc.receive("set-update-progress", (progress) => this.setState({ progress: progress }))
        window.ipc.receive("update-error", (errorType, errorMessage) => {
            switch (errorType) {
                case "JavaError":
                    this.openErrorBox(errorMessage, t("update.errors.java-download-error"))
                    break
                case "ForgeError":
                    this.openErrorBox(errorMessage, t("update.errors.forge-error"))
                    break
                default:
                    this.setState(errorMessage)
                    break
            }

        })
    }
    openErrorBox(message, title = "") {
        const { t } = this.props
        title = !title ? t("error") : title
        Swal.fire({
            title: title,
            html: `<p style="color: white;">${message}</p>`,
            icon: "error",
            confirmButtonColor: "#54c2f0",
            background: "#333",
        }
        ).then(() => {
            this.props.history.push("/launcher")
        })

    }

    render() {
        const { progress, updateText } = this.state
        return (
            <div className="updater-content">
                <div className="update-box">
                    <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="logo" />
                    <h3>{updateText}</h3>
                    <LinearProgress variant={progress === 0 ? "indeterminate" : "determinate"} value={progress} />
                </div>
            </div>)
    }

}

export default withTranslation()(Updater)