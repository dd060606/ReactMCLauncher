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
  showPassword: boolean;
  currentAuthType: string;
  isAuthenticating: boolean;
  rememberMe: boolean;
  email: string;
  password: string;
  autoAuth: boolean;
};
type Props = {
  navigate: NavigateFunction;
};

class Auth extends Component<Props & WithTranslation, State> {
  state = {
    showPassword: false,
    currentAuthType: "microsoft",
    isAuthenticating: false,
    rememberMe: true,
    email: "",
    password: "",
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
    window.ipc.receive("auth-success", () => this.props.navigate("/launcher"));

    window.ipc.receive("auto-auth-response", (res) => {
      if (res) {
        this.props.navigate("/launcher");
      } else {
        this.setState({ autoAuth: false });
      }
    });
  }

  /**
   * Parses an error and returns a user-friendly title and description
   * for our error overlay.
   *
   * @param {Error | {cause: string, error: string, errorMessage: string}} err A Node.js
   * error or Mojang error response.
   */
  resolveError(err: string) {
    const { t } = this.props;
    /*
    // Mojang Response => err.cause | err.error | err.errorMessage
    // Node error => err.code | err.message
    if (err.cause != null && err.cause === "UserMigratedException") {
      return {
        title: t("auth.errors.userMigrated.title"),
        desc: t("auth.errors.userMigrated.desc"),
      };
    } else {
      if (err.error != null) {
        if (err.error === "ForbiddenOperationException") {
          if (err.errorMessage != null) {
            if (
              err.errorMessage ===
              "Invalid credentials. Invalid username or password."
            ) {
              return {
                title: t("auth.errors.invalidCredentials.title"),
                desc: t("auth.errors.invalidCredentials.desc"),
              };
            } else if (err.errorMessage === "Invalid credentials.") {
              return {
                title: t("auth.errors.rateLimit.title"),
                desc: t("auth.errors.rateLimit.desc"),
              };
            }
          }
        }
      } else {
        // Request errors (from Node).
        if (err.code != null) {
          if (err.code === "ENOENT") {
            // No Internet.
            return {
              title: t("auth.errors.noInternet.title"),
              desc: t("auth.errors.noInternet.desc"),
            };
          } else if (err.code === "ENOTFOUND") {
            // Could not reach server.
            return {
              title: t("auth.errors.authDown.title"),
              desc: t("auth.errors.authDown.desc"),
            };
          }
        }
      }
    }
    if (err.message != null) {
      if (err.message === "NotPaidAccount") {
        return {
          title: t("auth.errors.notPaid.title"),
          desc: t("auth.errors.notPaid.desc"),
        };
      } else {
        // Unknown error with request.
        return {
          title: t("auth.errors.unknown.title"),
          desc: err.message,
        };
      }
    } else {
      // Unknown Mojang error.
      return {
        title: err.error,
        desc: err.errorMessage,
      };
    }
    */
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

  handleLogin = () => {
    const { t } = this.props;
    const { email, password, rememberMe } = this.state;
    const usernameRegex = /^[a-zA-Z0-9_]{1,16}$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    this.setState({ isAuthenticating: true });

    if (!email || !password) {
      this.openErrorBox(t("auth.errors.complete-all-fields"));
    } else if (!usernameRegex.test(email) && !emailRegex.test(email)) {
      this.openErrorBox(t("auth.errors.wrong-username"));
    } else {
      window.ipc.send("mojang-login", {
        username: email,
        password: password,
        autoAuth: rememberMe,
      });
    }
  };

  handleMicrosoftLogin = () => {
    const { isAuthenticating, rememberMe } = this.state;
    if (!isAuthenticating) {
      this.setState({ isAuthenticating: true });
      window.ipc.send("microsoft-login", { autoAuth: rememberMe });
    }
  };

  render() {
    const { t } = this.props;
    const {
      showPassword,
      currentAuthType,
      isAuthenticating,
      rememberMe,
      email,
      password,
      autoAuth,
    } = this.state;
    return (
      <div className="auth-content">
        <img
          src={`${process.env.PUBLIC_URL}/assets/images/logo.png`}
          alt="logo"
        />
        {!autoAuth && (
          <div className="auth-box">
            <h2>{t("auth.authentication")}</h2>
            <div className="auth-selector">
              <div
                className="auth-type"
                style={{
                  border: `2px solid ${
                    currentAuthType === "mojang" ? "#56B5FC" : "white"
                  }`,
                }}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/mojang.png`}
                  alt="mojang"
                  width={15}
                />{" "}
                Mojang
              </div>
              <div
                className="auth-type"
                onClick={this.handleMicrosoftLogin}
                style={{
                  border: `2px solid ${
                    currentAuthType === "microsoft" ? "#56B5FC" : "white"
                  }`,
                }}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/microsoft.png`}
                  alt="microsoft"
                  width={15}
                />{" "}
                Microsoft
              </div>
            </div>
            <div className="fields">
              <div className="field">
                <i className="fas fa-envelope"></i>
                <input
                  disabled={isAuthenticating}
                  type="text"
                  name="username-field"
                  id="username-field"
                  placeholder={t("auth.email")}
                  value={email}
                  onChange={(event) =>
                    this.setState({ email: event.target.value })
                  }
                />
                <span className="underline-animation"></span>
              </div>
              <div className="field">
                <i className="fas fa-lock-alt"></i>
                <input
                  disabled={isAuthenticating}
                  type={`${showPassword ? "text" : "password"}`}
                  name="password-field"
                  id="password-field"
                  placeholder={t("auth.password")}
                  value={password}
                  onChange={(event) =>
                    this.setState({ password: event.target.value })
                  }
                />
                <i
                  className={`fal ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                  onClick={() => this.setState({ showPassword: !showPassword })}
                ></i>
                <span className="underline-animation"></span>
              </div>
            </div>

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={() => this.setState({ rememberMe: !rememberMe })}
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
              onClick={this.handleLogin}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <CircularProgress color="primary" size={25} />
              ) : (
                t("auth.login")
              )}
            </Button>
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
