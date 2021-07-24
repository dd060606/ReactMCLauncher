import { Component } from "react"
import { withTranslation } from 'react-i18next'
import "../i18n"
import { Button, CircularProgress, FormControlLabel, Checkbox } from "@material-ui/core"
import "./css/Auth.css"
import Swal from "sweetalert2"

class Auth extends Component {

    state = {
        showPassword: false,
        currentAuthType: "mojang",
        isAuthenticating: false,
        rememberMe: true,
        email: "",
        password: "",
    }

    openErrorBox(message) {
        const { t } = this.props
        Swal.fire({
            title: t("auth.errors.error"),
            html: `<p style="color: white;">${message}</p>`,
            icon: "error",
            confirmButtonColor: "#54c2f0",
            background: "#333",

        }
        ).then(() => {
            this.setState({ isAuthenticating: false })
        })

    }

    //Arrow fx for binding


    handleLogin = () => {
        const { t } = this.props
        const { email, password } = this.state
        const usernameRegex = /^[a-zA-Z0-9_]{1,16}$/
        const emailRegex = /^\S+@\S+\.\S+$/
        this.setState({ isAuthenticating: true })

        if (!email || !password) {
            this.openErrorBox(t("auth.errors.complete-all-fields"))
        }
        else if (!usernameRegex.test(email) && !emailRegex.test(email)) {
            this.openErrorBox(t("auth.errors.wrong-username"))
        }
        else {

        }


    }

    render() {
        const { t } = this.props
        const { showPassword, currentAuthType, isAuthenticating, rememberMe, email, password } = this.state
        return (
            <div className="auth-content">
                <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="logo" />
                <div className="auth-box">
                    <h2>{t("auth.authentication")}</h2>
                    <div className="auth-selector">
                        <div className="auth-type" style={{ border: `2px solid ${currentAuthType === "mojang" ? "#56B5FC" : "white"}` }} ><img src={`${process.env.PUBLIC_URL}/assets/images/mojang.png`} alt="mojang" width={15} /> Mojang</div>
                        <div className="auth-type" style={{ border: `2px solid ${currentAuthType === "microsoft" ? "#56B5FC" : "white"}` }}><img src={`${process.env.PUBLIC_URL}/assets/images/microsoft.png`} alt="microsoft" width={15} /> Microsoft</div>

                    </div>
                    <div className="fields">
                        <div className="field" >
                            <i className="fas fa-envelope"></i>
                            <input disabled={isAuthenticating} type="text" name="username-field" id="username-field" placeholder={t("auth.email")} value={email} onChange={event => this.setState({ email: event.target.value })} />
                            <span class="underline-animation" style={{}}></span>


                        </div>
                        <div className="field">
                            <i className="fas fa-lock-alt"></i>
                            <input disabled={isAuthenticating} type={`${showPassword ? "text" : "password"}`} name="password-field" id="password-field" placeholder={t("auth.password")} value={password} onChange={event => this.setState({ password: event.target.value })} />
                            <i className={`fal ${showPassword ? "fa-eye" : "fa-eye-slash"}`} onClick={() => this.setState({ showPassword: !showPassword })}></i>
                            <span class="underline-animation"></span>

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
                        label={t("auth.remember-me")}
                        className="remember-me-label"
                    />
                    <Button variant="contained" className="login-button" onClick={this.handleLogin} disabled={isAuthenticating}>
                        {isAuthenticating ? <CircularProgress color="primary" size={25} /> : t("auth.login")}
                    </Button>
                </div>
            </div>
        )
    }

}

export default withTranslation()(Auth)