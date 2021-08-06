import { Component } from "react"
import { withTranslation } from 'react-i18next'
import "../i18n"
import "./css/Launcher.css"

class Launcher extends Component {

    state = {
        playerName: "",
        playerUuid: ""
    }

    componentDidMount() {
        this.setState({ playerName: window.ipc.sendSync("get-player-name"), playerUuid: window.ipc.sendSync("get-player-uuid") })
    }



    render() {
        const { t } = this.props
        const { playerUuid, playerName } = this.state
        return (
            <div className="launcher-content">
                <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="logo" />
                <div className="player-box">
                    <div className="head-box">
                        <img src={`https://crafatar.com/avatars/${playerUuid}?size=50&overlay=true`} alt="player-head" className="player-head" />

                    </div>
                    <p>{playerName}</p>
                </div>
                <div className="play-box">
                    <button className="play-button">{t("launcher.play")}</button>
                    <button className="settings-button" onClick={() => this.props.history.push("/settings")}><i className="fas fa-cog"></i></button>
                </div>
            </div>)
    }

}

export default withTranslation()(Launcher)