import { Component } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import "i18n";
import "css/Settings.css";
import { Slider, Button, FormControlLabel, Switch } from "@mui/material";

import { withRouter } from "utils/withRouter";
import { NavigateFunction } from "react-router-dom";

/*
const LauncherSwitch = makeStyles({
  switchBase: {
    color: "#56B5FC",
    "&$checked": {
      color: "#56B5FC",
    },
    "&$checked + $track": {
      backgroundColor: "#56B5FC",
    },
  },
  checked: {},
  track: {},
})(Switch);
*/
type State = {
  memory: number;
  availableMemory: number;
  autoAuth: boolean;
  keepLauncherOpen: boolean;
  playerUuid: string;
  playerName: string;
};
type Props = {
  navigate: NavigateFunction;
};
class Settings extends Component<Props & WithTranslation, State> {
  state = {
    memory: 0,
    availableMemory: 4,
    autoAuth: true,
    keepLauncherOpen: false,
    playerUuid: "",
    playerName: "",
  };

  componentDidMount() {
    this.setState({
      availableMemory: window.ipc.sendSync("available-memory"),
      memory: window.ipc.sendSync("get-memory"),
      autoAuth: window.ipc.sendSync("is-auto-auth"),
      keepLauncherOpen: window.ipc.sendSync("is-keep-launcher-open"),
      playerName: window.ipc.sendSync("get-player-name"),
      playerUuid: window.ipc.sendSync("get-player-uuid"),
    });
  }

  //Arrow fx for binding
  handleMemoryChange = (event: Event, newValue: number | number[]) => {
    this.setState({ memory: newValue as number });
    window.ipc.send("set-memory", newValue);
  };
  handleAutoAuthChange = () => {
    const { autoAuth } = this.state;
    window.ipc.send("set-auto-auth", !autoAuth);
    this.setState({ autoAuth: !autoAuth });
  };
  handleKeepLauncherOpenChange = () => {
    const { keepLauncherOpen } = this.state;
    window.ipc.send("set-keep-launcher-open", !keepLauncherOpen);
    this.setState({ keepLauncherOpen: !keepLauncherOpen });
  };
  handleLogoutClick = () => {
    window.ipc.send("logout");
    this.props.navigate("/auth");
  };

  render() {
    const { t } = this.props;
    const {
      memory,
      availableMemory,
      autoAuth,
      keepLauncherOpen,
      playerUuid,
      playerName,
    } = this.state;
    return (
      <div className="settings-content">
        <div className="title-box">
          <i
            className="fas fa-arrow-left"
            onClick={() => this.props.navigate("/launcher")}
          />
          <h1> {t("settings.settings")}</h1>
        </div>
        <div className="settings-box">
          <section className="minecraft">
            <h2>Minecraft</h2>
            <div className="line" />
            <h4>
              {t("settings.memory")}: {memory}G
            </h4>
            <Slider
              valueLabelDisplay="auto"
              max={availableMemory}
              min={1}
              value={memory}
              onChange={this.handleMemoryChange}
            />
            <Button onClick={() => window.ipc.send("open-game-dir")}>
              {t("settings.open-game-dir")}
            </Button>
          </section>
          <section className="launcher">
            <h2>Launcher</h2>
            <div className="line" />
            <FormControlLabel
              className="switch-label"
              control={
                <Switch
                  checked={autoAuth}
                  onChange={this.handleAutoAuthChange}
                />
              }
              label={t("settings.auto-auth").toString()}
              labelPlacement="start"
            />
            <FormControlLabel
              className="switch-label"
              control={
                <Switch
                  checked={keepLauncherOpen}
                  onChange={this.handleKeepLauncherOpenChange}
                />
              }
              label={t("settings.keep-launcher-open").toString()}
              labelPlacement="start"
            />
          </section>
          <section className="account">
            <h2>{t("settings.account")}</h2>
            <div className="line" />
            <div className="account-box">
              <div>
                <img
                  src={`https://crafatar.com/avatars/${playerUuid}?size=50&overlay=true`}
                  alt="player-head"
                  className="player-head"
                />
                <span>{playerName}</span>
              </div>
              <Button
                className="logout-button"
                onClick={this.handleLogoutClick}
              >
                {t("settings.logout")}
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default withTranslation()(withRouter<Props & WithTranslation>(Settings));
