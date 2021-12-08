const msmc = require("msmc")
/**
 * AuthManager
 * 
 * This module aims to abstract login procedures. Results from Mojang's REST api
 * are retrieved through our Mojang module. These results are processed and stored,
 * if applicable, in the config using the ConfigManager. All login procedures should
 * be made through this module.
 * 
 * @module authmanager
 */
// Requirements
const ConfigManager = require('./configmanager')
const LoggerUtil = require('./logger')
const Mojang = require('./auth/mojang')
const logger = LoggerUtil('%c[AuthManager]', 'color: #a02d2a; font-weight: bold')
const { BrowserWindow } = require("electron")
const main = require("../../../main")

const loggerSuccess = LoggerUtil('%c[AuthManager]', 'color: #209b07; font-weight: bold')

// Functions

/**
 * Add an account. This will authenticate the given credentials with Mojang's
 * authserver. The resultant data will be stored as an auth account in the
 * configuration database.
 * 
 * @param {string} username The account username (email if migrated).
 * @param {string} password The account password.
 * @returns {Promise.<Object>} Promise which resolves the resolved authenticated account object.
 */
exports.addAccount = async function (username, password) {
    try {
        const session = await Mojang.authenticate(username, password, ConfigManager.getClientToken())
        if (session.selectedProfile != null) {
            const ret = ConfigManager.addAuthAccount(session.selectedProfile.id, session.accessToken, username, session.selectedProfile.name, "mojang")
            if (ConfigManager.getClientToken() == null) {
                ConfigManager.setClientToken(session.clientToken)
            }
            ConfigManager.saveConfig()
            return ret
        } else {
            throw new Error('NotPaidAccount')
        }

    } catch (err) {
        return Promise.reject(err)
    }
}

/**
 * Add an microsoft account. This will authenticate the given credentials with Microsoft's
 * authserver. The resultant data will be stored as an auth account in the
 * configuration database.
 * 
 * @returns {Promise.<Object>} Promise which resolves the resolved authenticated account object.
 */
exports.addMicrosoftAccount = async function () {


    msmc.fastLaunch("electron",
        (update) => {
            //A hook for catching loading bar events and errors, standard with MSMC
            if (update.data) {
                logger.log(update.data)
            }
        }).then(result => {
            //Let's check if we logged in?
            if (msmc.errorCheck(result)) {
                main.win.webContents.send("microsoft-auth-err", result.reason)
                logger.error(result.reason)
                return
            }
            //If the login works
            logger.log("Successfully authenticated to microsoft!")
            const session = msmc.getMCLC().getAuth(result)
            ConfigManager.addAuthAccount(session.uuid, session.access_token, "", session.name, "microsoft")
            ConfigManager.saveConfig()
            main.win.webContents.send("auth-success")
        }).catch(reason => {
            //If the login fails
            logger.error("Error while logging in : " + reason)
            main.win.webContents.send("microsoft-auth-err", reason)

        })

}


/**
 * Remove an account. This will invalidate the access token associated
 * with the account and then remove it from the database.
 * 
 * @param {string} uuid The UUID of the account to be removed.
 * @returns {Promise.<void>} Promise which resolves to void when the action is complete.
 */
exports.removeAccount = async function (uuid) {
    try {
        const authAcc = ConfigManager.getAuthAccount(uuid)
        if (authAcc.authType === "mojang") {
            await Mojang.invalidate(authAcc.accessToken, ConfigManager.getClientToken())
        }
        ConfigManager.removeAuthAccount(uuid)
        ConfigManager.saveConfig()
        return Promise.resolve()
    } catch (err) {
        return Promise.reject(err)
    }
}

/**
 * Validate the selected account with Mojang's authserver. If the account is not valid,
 * we will attempt to refresh the access token and update that value. If that fails, a
 * new login will be required.
 * 
 * **Function is WIP**
 * 
 * @returns {Promise.<boolean>} Promise which resolves to true if the access token is valid,
 * otherwise false.
 */
exports.validateSelected = async function () {
    const current = ConfigManager.getSelectedAccount()
    const isValid = await Mojang.validate(current.accessToken, ConfigManager.getClientToken())
    if (!isValid) {
        try {
            const session = await Mojang.refresh(current.accessToken, ConfigManager.getClientToken())
            ConfigManager.updateAuthAccount(current.uuid, session.accessToken)
            ConfigManager.saveConfig()
        } catch (err) {
            logger.debug('Error while validating selected profile:', err)
            if (err && err.error === 'ForbiddenOperationException') {
                // What do we do?
            }
            logger.log('Account access token is invalid.')
            return false
        }
        loggerSuccess.log('Account access token validated.')
        return true
    } else {
        loggerSuccess.log('Account access token validated.')
        return true
    }
}

