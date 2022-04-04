import { Component } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import "i18n";
import "css/Updater.css";
import { LinearProgress } from "@mui/material";
import Swal from "sweetalert2";
import { withRouter } from "utils/withRouter";
import { NavigateFunction } from "react-router-dom";

type State = {
  progress: number;
  updateText: string;
};
type Props = {
  navigate?: NavigateFunction;
} & WithTranslation;

class LauncherUpdater extends Component<Props, State> {
  state = {
    progress: 0,
    updateText: "",
  };

  componentDidMount() {
    const { t } = this.props;
    this.setState({ updateText: t("update.searching-updates") + "..." });
    window.ipc.send("check-auto-update");

    window.ipc.receive("set-launcher-update-progress", (percent: number) => {
      this.setState({
        updateText: t("update.downloading-launcher") + "... (" + percent + "%)",
      });
      this.setState({ progress: percent });
    });
    window.ipc.receive("launcher-update-error", (errorMessage: string) => {
      this.openErrorBox(errorMessage, t("update.errors.launcher-error"));
    });
    window.ipc.receive(
      "launcher-update-finished",
      (askToInstallUpdates: boolean) => {
        if (askToInstallUpdates) {
          Swal.fire({
            title: t("update.download-finished"),
            text: t("update.install-updates"),
            icon: "question",
            iconColor: "#54c2f0",
            confirmButtonColor: "#54c2f0",
            confirmButtonText: t("confirm"),
            cancelButtonText: t("cancel"),
            showCancelButton: true,
            background: "#333",
          }).then((res) => {
            if (res.isConfirmed) {
              window.ipc.send("install-updates");
            }
            // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
            this.props.navigate("/auth");
          });
        } else {
          // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
          this.props.navigate("/auth");
        }
      }
    );
    window.ipc.receive("update-available-mac", () => {
      Swal.fire({
        title: t("update.update-available"),
        html: `${t("update.new-update-available")}`,
        icon: "info",
        confirmButtonColor: "#54c2f0",
        background: "#333",
      }).then(() => {
        // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
        this.props.navigate("/auth");
      });
    });
  }
  openErrorBox(message: string, title: string = "") {
    const { t } = this.props;
    title = !title ? t("error") : title;
    Swal.fire({
      title: title,
      html: `<p style="color: white;">${message}</p>`,
      icon: "error",
      confirmButtonColor: "#54c2f0",
      background: "#333",
    }).then(() => {
      // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
      this.props.navigate("/auth");
    });
  }

  render() {
    const { progress, updateText } = this.state;
    return (
      <div className="updater-content">
        <div className="update-box">
          <img src={"assets/logo.png"} alt="logo" />
          <h3>{updateText}</h3>
          <LinearProgress
            variant={progress === 0 ? "indeterminate" : "determinate"}
            value={progress}
          />
        </div>
      </div>
    );
  }
}

export default withTranslation()(withRouter<Props>(LauncherUpdater));
