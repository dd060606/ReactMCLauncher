import { Component } from "react"
import { withTranslation } from 'react-i18next'
import "../i18n"
import "./css/Auth.css"

class Auth extends Component {

    state = {
        showPassword: false,
        currentAuthType: "mojang"
    }

    render() {
        const { t } = this.props
        const { showPassword, currentAuthType } = this.state
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
                        <div className="field">
                            <i className="fas fa-envelope"></i>
                            <input type="text" name="username-field" id="username-field" placeholder={t("auth.email")} style={{ marginRight: showPassword ? 22 : 20 }} />


                        </div>
                        <div className="field">
                            <i className="fas fa-lock-alt"></i>
                            <input type={`${showPassword ? "text" : "password"}`} name="password-field" id="password-field" placeholder={t("auth.password")} />
                            <i className={`fal ${showPassword ? "fa-eye" : "fa-eye-slash"}`} onClick={() => this.setState({ showPassword: !showPassword })}></i>

                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default withTranslation()(Auth)