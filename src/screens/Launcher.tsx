import { Component } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { Tooltip } from "@mui/material";
import "i18n";
import Swal from "sweetalert2";
import "css/Launcher.css";
import { withRouter } from "utils/withRouter";
import { NavigateFunction } from "react-router-dom";

type State = {
  playerName: string;
  playerUuid: string;
  playersCount: string;
  serverStatus: string;
};

type Props = {
  navigate?: NavigateFunction;
};

class Launcher extends Component<Props & WithTranslation, State> {
  state = {
    playerName: "",
    playerUuid: "",
    playersCount: "",
    serverStatus: "offline",
  };

  componentDidMount() {
    window.ipc.send("ping-server");
    window.ipc.receive("ping-server-result", (res) => {
      if (res) {
        this.setState({
          serverStatus: "online",
          playersCount: res.players.online + "/" + res.players.max,
        });
      } else {
        this.setState({ serverStatus: "offline", playersCount: "0" });
      }
    });
    this.setState({
      playerName: window.ipc.sendSync("get-player-name"),
      playerUuid: window.ipc.sendSync("get-player-uuid"),
    });
    setInterval(() => window.ipc.send("ping-server"), 30000);
  }

  handleOpenExternalLink(value: string) {
    const config = window.ipc.sendSync("get-dynamic-config");
    if (config) {
      let linkToOpen = "";
      switch (value) {
        case "twitter":
          linkToOpen = config.twitter;
          break;
        case "youtube":
          linkToOpen = config.youtube;
          break;
        case "discord":
          linkToOpen = config.discord;
          break;
        default:
          linkToOpen = "";
          break;
      }
      if (linkToOpen) {
        window.ipc.send("open-link", linkToOpen);
      }
    }
  }

  //Arrow fx for binding
  handlePlay = () => {
    const { t } = this.props;
    const config = window.ipc.sendSync("get-dynamic-config");
    if (!config.maintenance) {
      window.ipc.send("play");
      // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
      this.props.navigate("/updater");
    } else {
      Swal.fire({
        title: t("launcher.maintenance"),
        html: `<p style="color: white;">${config.maintenanceMessage}</p>`,
        icon: "warning",
        confirmButtonColor: "#54c2f0",
        background: "#333",
      });
    }
  };
  getNews() {
    const config = window.ipc.sendSync("get-dynamic-config");
    return config.news;
  }

  render() {
    const { t } = this.props;
    const { playerUuid, playerName, playersCount, serverStatus } = this.state;
    return (
      <div className="launcher-content">
        <img src={`assets/logo.png`} alt="logo" />
        <div className="player-box">
          <div className="head-box">
            <img
              src={`https://mc-heads.net/avatar/${playerUuid}/50`}
              alt="player-head"
              className="player-head"
            />
          </div>
          <p>{playerName}</p>
        </div>
        <div className="play-content">
          <div className="server-infos">
            <p className="server-status">
              {t("launcher.server-status")}:{" "}
              <span
                className="server-status-indicator"
                style={{
                  backgroundColor:
                    serverStatus === "online" ? "#2AE91D" : "red",
                }}
              />
            </p>
            <p className="players">
              {t("launcher.players")}: <span>{playersCount}</span>
            </p>
          </div>
          <div className="play-box">
            <button className="play-button" onClick={this.handlePlay}>
              {t("launcher.play")}
            </button>
            <button
              className="settings-button"
              // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
              onClick={() => this.props.navigate("/settings")}
            >
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>

        <div className="external-links">
          <Tooltip title="Discord" placement="top">
            <div
              className="external-link"
              onClick={() => this.handleOpenExternalLink("discord")}
            >
              <img
                src={`assets/discord.png`}
                alt="discord"
                className="external-link-img"
              />
            </div>
          </Tooltip>
          <Tooltip title="Twitter" placement="top">
            <div
              className="external-link"
              onClick={() => this.handleOpenExternalLink("twitter")}
            >
              <img
                src={`assets/twitter.png`}
                alt="twitter"
                className="external-link-img"
              />
            </div>
          </Tooltip>
          <Tooltip title="Youtube" placement="top">
            <div
              className="external-link"
              onClick={() => this.handleOpenExternalLink("youtube")}
            >
              <img
                src={`assets/youtube.png`}
                alt="youtube"
                className="external-link-img"
              />
            </div>
          </Tooltip>
        </div>
        <div className="news-box">
          <h3>{t("launcher.news")}</h3>
          <p>{this.getNews()}</p>
        </div>
      </div>
    );
  }
}

export default withTranslation()(withRouter<Props & WithTranslation>(Launcher));
