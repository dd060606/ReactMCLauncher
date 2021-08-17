import { Component } from "react"
import { withTranslation } from 'react-i18next'
import "../i18n"
import "./css/Updater.css"
import { LinearProgress } from "@material-ui/core"
import Swal from "sweetalert2"

class LauncherUpdater extends Component {

    state = {
        progress: 0,
        updateText: ""
    }

    componentDidMount() {
        const { t } = this.props
        this.setState({ updateText: t("update.searching-updates") + "..." })
        window.ipc.receive("set-launcher-update-text", (text) => {
            const { progress } = this.state
            this.setState({ updateText: t("update.downloading-launcher") + "... (" + progress + "%)" })
        })
        window.ipc.receive("set-launcher-update-progress", (progress) => this.setState({ progress: progress }))
        window.ipc.receive("launcher-update-error", (errorMessage) => {
            this.openErrorBox(errorMessage, t("update.errors.launcher-error"))
        })
        window.ipc.receive("launcher-update-finished", () => {
            console.log("be")
            this.props.history.push("/auth")
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
            this.props.history.push("/auth")
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

export default withTranslation()(LauncherUpdater)