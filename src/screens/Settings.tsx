import { Component } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import "i18n";
import "css/Settings.css";
import {
  Slider,
  Button,
  FormControlLabel,
  Switch,
  styled,
} from "@mui/material";

import { withRouter } from "utils/withRouter";
import { NavigateFunction } from "react-router-dom";

type State = {
  memory: number;
  availableMemory: number;
  autoAuth: boolean;
  keepLauncherOpen: boolean;
  playerUuid: string;
  playerName: string;
};
type Props = {
  navigate?: NavigateFunction;
};

const LauncherSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#54c2f0",
    "&:hover": {
      backgroundColor: "rgba(84, 194,240,0.1)",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#54c2f0",
  },
}));

const LauncherSlider = styled(Slider)({
  color: "#54c2f0",
  width: "80%",
  justifySelf: "center",
  alignSelf: "center",
  height: 8,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#54c2f0",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});
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
    // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
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
            // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
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
            <LauncherSlider
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
                <LauncherSwitch
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
                <LauncherSwitch
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
