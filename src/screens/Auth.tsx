import { Component } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import "i18n";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import "css/Auth.css";
import { withRouter } from "utils/withRouter";
import { NavigateFunction } from "react-router-dom";
import Swal from "sweetalert2";

type State = {
  currentAuthType: string;
  isAuthenticating: boolean;
  rememberMe: boolean;
  username: string;
  autoAuth: boolean;
};
type Props = {
  navigate?: NavigateFunction;
};

class Auth extends Component<Props & WithTranslation, State> {
  state = {
    currentAuthType: "microsoft",
    isAuthenticating: false,
    rememberMe: true,
    username: "",
    autoAuth: true,
  };

  componentDidMount() {
    window.ipc.send("auto-auth");

    window.ipc.receive("microsoft-auth-err", (err) => {
      if (err) {
        //Desc and title
        this.openErrorBox(err);
      } else {
        this.setState({ isAuthenticating: false });
      }
    });

    // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
    window.ipc.receive("auth-success", () => this.props.navigate("/launcher"));

    window.ipc.receive("auto-auth-response", (res) => {
      if (res) {
        // @ts-ignore: Cannot invoke an object which is possibly 'undefined'
        this.props.navigate("/launcher");
      } else {
        this.setState({ autoAuth: false });
      }
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
      this.setState({ isAuthenticating: false });
    });
  }

  //Arrow fx for binding

  handleOfflineLogin = () => {
    const { t } = this.props;
    const { username, rememberMe } = this.state;
    const usernameRegex = /^[a-zA-Z0-9_]{1,16}$/;
    this.setState({ isAuthenticating: true });

    if (!username) {
      this.openErrorBox(t("auth.errors.complete-all-fields"));
    } else if (!usernameRegex.test(username)) {
      this.openErrorBox(t("auth.errors.wrong-username"));
    } else {
      window.ipc.send("offline-login", {
        username: username,
        autoAuth: rememberMe,
      });
    }
  };

  handleMicrosoftLogin = () => {
    const { isAuthenticating, rememberMe } = this.state;
    if (!isAuthenticating) {
      this.setState({ isAuthenticating: true });
      window.ipc.send("microsoft-login", rememberMe);
    }
  };

  render() {
    const { t } = this.props;
    const {
      currentAuthType,
      isAuthenticating,
      rememberMe,
      username,
      autoAuth,
    } = this.state;
    return (
      <div className="auth-content">
        <img src={"assets/logo.png"} alt="logo" />
        {!autoAuth && (
          <div className="auth-box">
            <h2>{t("auth.authentication")}</h2>
            <div className="auth-selector">
              <div
                className="auth-type"
                onClick={() => this.setState({ currentAuthType: "microsoft" })}
                style={{
                  border: `2px solid ${
                    currentAuthType === "microsoft" ? "#56B5FC" : "white"
                  }`,
                }}
              >
                <img src={`assets/microsoft.png`} alt="microsoft" width={15} />{" "}
                Microsoft
              </div>
              <div
                className="auth-type"
                onClick={() => this.setState({ currentAuthType: "offline" })}
                style={{
                  border: `2px solid ${
                    currentAuthType === "offline" ? "#56B5FC" : "white"
                  }`,
                }}
              >
                {" "}
                Offline
              </div>
            </div>
            {currentAuthType === "offline" && (
              <>
                {" "}
                <div className="fields">
                  <div className="field">
                    <i className="fas fa-user"></i>
                    <input
                      disabled={isAuthenticating}
                      type="text"
                      name="username-field"
                      id="username-field"
                      placeholder={t("auth.username")}
                      value={username}
                      onChange={(event) =>
                        this.setState({ username: event.target.value })
                      }
                    />
                    <span className="underline-animation"></span>
                  </div>
                </div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={() =>
                        this.setState({ rememberMe: !rememberMe })
                      }
                      name="remember-me"
                      style={{
                        color: "#56B5FC",
                      }}
                    />
                  }
                  label={t("auth.remember-me").toString()}
                  className="remember-me-label"
                />
                <Button
                  variant="contained"
                  className="login-button"
                  onClick={this.handleOfflineLogin}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <CircularProgress color="primary" size={25} />
                  ) : (
                    t("auth.login")
                  )}
                </Button>
              </>
            )}
            {currentAuthType === "microsoft" && (
              <>
                <Button
                  variant="contained"
                  className="login-microsoft-button"
                  onClick={this.handleMicrosoftLogin}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <CircularProgress color="primary" size={25} />
                  ) : (
                    t("auth.login-with-microsoft")
                  )}
                </Button>
              </>
            )}
          </div>
        )}
        {autoAuth && (
          <p className="auto-auth-text">
            {t("auth.logging-in") + "... "}
            <CircularProgress color="primary" size={25} />
          </p>
        )}
      </div>
    );
  }
}

export default withTranslation()(withRouter<Props & WithTranslation>(Auth));
