import { Component } from "react"
import { withTranslation } from 'react-i18next'
import { Tooltip } from "@material-ui/core"
import "../i18n"
import "./css/Launcher.css"

class Launcher extends Component {

    state = {
        playerName: "",
        playerUuid: "",
        playersCount: 0,
        serverStatus: "offline"
    }

    componentDidMount() {
        window.ipc.send("ping-server")
        window.ipc.receive("ping-server-result", res => {
            if (res) {
                this.setState({ serverStatus: "online", playersCount: res.players.online + "/" + res.players.max })
            }
            else {
                this.setState({ serverStatus: "offline", playersCount: 0 })
            }
        })
        this.setState({ playerName: window.ipc.sendSync("get-player-name"), playerUuid: window.ipc.sendSync("get-player-uuid") })
        setInterval(() => window.ipc.send("ping-server"), 30000)
    }


    handleOpenExternalLink(event) {
        const config = window.ipc.sendSync("get-dynamic-config")
        if (config) {
            let linkToOpen = ""
            switch (event.target.alt) {
                case "twitter":
                    linkToOpen = config.twitter
                    break
                case "youtube":
                    linkToOpen = config.youtube
                    break
                case "discord":
                    linkToOpen = config.discord
                    break
                default:
                    linkToOpen = ""
                    break
            }
            if (linkToOpen) {
                window.ipc.send("open-link", linkToOpen)
            }
        }

    }

    render() {
        const { t } = this.props
        const { playerUuid, playerName, playersCount, serverStatus } = this.state
        return (
            <div className="launcher-content">
                <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="logo" />
                <div className="player-box">
                    <div className="head-box">
                        <img src={`https://crafatar.com/avatars/${playerUuid}?size=50&overlay=true`} alt="player-head" className="player-head" />

                    </div>
                    <p>{playerName}</p>
                </div>
                <div className="play-content">
                    <div className="server-infos">
                        <p className="server-status">{t("launcher.server-status")}: <span className="server-status-indicator" style={{ backgroundColor: serverStatus === "online" ? "#2AE91D" : "red" }} /></p>
                        <p className="players">{t("launcher.players")}: <span>{playersCount}</span></p>

                    </div>
                    <div className="play-box">
                        <button className="play-button">{t("launcher.play")}</button>
                        <button className="settings-button" onClick={() => this.props.history.push("/settings")}><i className="fas fa-cog"></i></button>
                    </div>
                </div>

                <div className="external-links">
                    <Tooltip title="Discord" placement="top">
                        <div className="external-link" onClick={event => this.handleOpenExternalLink(event)}><img src={`${process.env.PUBLIC_URL}/assets/images/discord.png`} alt="discord" className="external-link-img" /></div>
                    </Tooltip>
                    <Tooltip title="Twitter" placement="top">
                        <div className="external-link" onClick={event => this.handleOpenExternalLink(event)}><img src={`${process.env.PUBLIC_URL}/assets/images/twitter.png`} alt="twitter" className="external-link-img" /></div>
                    </Tooltip>
                    <Tooltip title="Youtube" placement="top">
                        <div className="external-link" onClick={event => this.handleOpenExternalLink(event)}><img src={`${process.env.PUBLIC_URL}/assets/images/youtube.png`} alt="youtube" className="external-link-img" /></div>
                    </Tooltip>

                </div>
            </div>)
    }

}

export default withTranslation()(Launcher)