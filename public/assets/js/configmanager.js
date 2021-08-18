const fs = require("fs-extra")
const os = require("os")
const path = require("path")
const { app } = require("electron")
const axios = require("axios")

const main = require("../../../main")

const sysRoot = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support" : process.env.HOME)
const dataPath = path.join(sysRoot, "ReactMCLauncher")
const gamePath = path.join(sysRoot, ".ReactMCLauncher")


const launcherDir = process.env.CONFIG_DIRECT_PATH || app.getPath("userData")

const logger = require('./logger')('%c[ConfigManager]', 'color: #a02d2a; font-weight: bold')



/**
 * Retrieve the absolute path of the launcher directory.
 * 
 * @returns {string} The absolute path of the launcher directory.
 */
exports.getLauncherDirectory = function () {
    return launcherDir
}
/**
 * Retrieve the absolute path of the game directory.
 * 
 * @returns {string} The absolute path of the game directory.
 */
exports.getGameDirectory = function () {
    return gamePath
}

/**
 * Retrieve the absolute path of the launcher directory.
 * 
 * @returns {string} The absolute path of the launcher directory.
 */
exports.getDataDirectory = function (def = false) {
    return !def ? config.settings.launcher.dataDirectory : DEFAULT_CONFIG.settings.launcher.dataDirectory
}

const DEFAULT_CONFIG = {
    settings: {
        java: {
            minRAM: resolveMinRAM(),
            maxRAM: resolveMaxRAM(),
        },
        launcher: {
            dataDirectory: dataPath,
            keepLauncherOpen: false
        }
    },
    clientToken: null,
    autoAuth: true,
    accounts: {},
}
const configPath = path.join(exports.getLauncherDirectory(), 'config.json')
const configPathLEGACY = path.join(dataPath, 'config.json')

let config = null

let dynamicConfig = null

exports.getDynamicConfig = function () {
    return dynamicConfig
}
exports.loadDynamicConfig = function () {
    axios.get(main.LAUNCHER_CONFIG).then(res => {
        dynamicConfig = res.data
    })
        .catch(err => {
            logger.error(err)
        })
}

// Persistance Utility Functions

/**
 * Save the current configuration to a file.
 */
exports.saveConfig = function () {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'UTF-8')
}

exports.getAbsoluteMinRAM = function () {
    const mem = os.totalmem()
    return mem >= 6000000000 ? 3 : 2
}

exports.getAbsoluteMaxRAM = function () {
    const mem = os.totalmem()
    const gT16 = mem - 16000000000
    return Math.floor((mem - 1000000000 - (gT16 > 0 ? (Number.parseInt(gT16 / 8) + 16000000000 / 4) : mem / 4)) / 1000000000)
}

function resolveMaxRAM() {
    const mem = os.totalmem()
    return mem >= 8000000000 ? '4G' : (mem >= 6000000000 ? '3G' : '2G')
}

function resolveMinRAM() {
    return resolveMaxRAM()
}

/**
 * Load the configuration into memory. If a configuration file exists,
 * that will be read and saved. Otherwise, a default configuration will
 * be generated. Note that "resolved" values default to null and will
 * need to be externally assigned.
 */
exports.load = function () {
    let doLoad = true

    if (!fs.existsSync(configPath)) {
        fs.ensureDirSync(path.join(configPath, '..'))
        if (fs.existsSync(configPathLEGACY)) {
            fs.moveSync(configPathLEGACY, configPath)
        } else {
            doLoad = false
            config = DEFAULT_CONFIG
            exports.saveConfig()
        }
    }
    if (doLoad) {
        let doValidate = false
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'))
            doValidate = true
        } catch (err) {
            logger.error(err)
            logger.log('Configuration file contains malformed JSON or is corrupt.')
            logger.log('Generating a new configuration file.')
            fs.ensureDirSync(path.join(configPath, '..'))
            config = DEFAULT_CONFIG
            exports.saveConfig()
        }
        if (doValidate) {
            config = validateKeySet(DEFAULT_CONFIG, config)
            exports.saveConfig()
        }
    }
    logger.log("Successfully loaded!")
}

/**
 * @returns {boolean} Whether or not the manager has been loaded.
 */
exports.isLoaded = function () {
    return config != null
}

/**
 * Validate that the destination object has at least every field
 * present in the source object. Assign a default value otherwise.
 * 
 * @param {Object} srcObj The source object to reference against.
 * @param {Object} destObj The destination object.
 * @returns {Object} A validated destination object.
 */
function validateKeySet(srcObj, destObj) {
    if (srcObj == null) {
        srcObj = {}
    }
    const validationBlacklist = ["accounts"]
    const keys = Object.keys(srcObj)
    for (let i = 0; i < keys.length; i++) {
        if (typeof destObj[keys[i]] === "undefined") {
            destObj[keys[i]] = srcObj[keys[i]]
        } else if (typeof srcObj[keys[i]] === "object" && srcObj[keys[i]] != null && !(srcObj[keys[i]] instanceof Array) && validationBlacklist.indexOf(keys[i]) === -1) {
            destObj[keys[i]] = validateKeySet(srcObj[keys[i]], destObj[keys[i]])
        }
    }
    return destObj
}

/**
 * Retrieve the launcher's Client Token.
 * There is no default client token.
 * 
 * @returns {string} The launcher's Client Token.
 */
exports.getClientToken = function () {
    return config.clientToken
}

/**
 * Set the launcher's Client Token.
 * 
 * @param {string} clientToken The launcher's new Client Token.
 */
exports.setClientToken = function (clientToken) {
    config.clientToken = clientToken
}



/**
 * Get an array of each account currently authenticated by the launcher.
 * 
 * @returns {Array.<Object>} An array of each stored authenticated account.
 */
exports.getAuthAccounts = function () {
    return config.accounts
}

/**
 * Returns the authenticated account with the given uuid. Value may
 * be null.
 * 
 * @param {string} uuid The uuid of the authenticated account.
 * @returns {Object} The authenticated account with the given uuid.
 */
exports.getAuthAccount = function (uuid) {
    return config.accounts[uuid]
}

/**
 * Update the access token of an authenticated account.
 * 
 * @param {string} uuid The uuid of the authenticated account.
 * @param {string} accessToken The new Access Token.
 * 
 * @returns {Object} The authenticated account object created by this action.
 */
exports.updateAuthAccount = function (uuid, accessToken) {
    config.accounts[uuid].accessToken = accessToken
    return config.accounts[uuid]
}

/**
 * Adds an authenticated account to the database to be stored.
 * 
 * @param {string} uuid The uuid of the authenticated account.
 * @param {string} accessToken The accessToken of the authenticated account.
 * @param {string} username The username (usually email) of the authenticated account.
 * @param {string} displayName The in game name of the authenticated account.
 * 
 * @returns {Object} The authenticated account object created by this action.
 */
exports.addAuthAccount = function (uuid, accessToken, username, displayName, authType) {
    config.selectedAccount = uuid
    config.accounts[uuid] = {
        accessToken,
        username: username.trim(),
        uuid: uuid.trim(),
        displayName: displayName.trim(),
        authType: authType
    }
    return config.accounts[uuid]
}

/**
 * Remove an authenticated account from the database. If the account
 * was also the selected account, a new one will be selected. If there
 * are no accounts, the selected account will be null.
 * 
 * @param {string} uuid The uuid of the authenticated account.
 * 
 * @returns {boolean} True if the account was removed, false if it never existed.
 */
exports.removeAuthAccount = function (uuid) {
    if (config.accounts[uuid] != null) {
        delete config.accounts[uuid]
        if (config.selectedAccount === uuid) {
            const keys = Object.keys(config.accounts)
            if (keys.length > 0) {
                config.selectedAccount = keys[0]
            } else {
                config.selectedAccount = null
                config.clientToken = null
            }
        }
        return true
    }
    return false
}

/**
 * Get the currently selected authenticated account.
 * 
 * @returns {Object} The selected authenticated account.
 */
exports.getSelectedAccount = function () {
    return config.accounts[config.selectedAccount]
}

/**
 * Set the selected authenticated account.
 * 
 * @param {string} uuid The UUID of the account which is to be set
 * as the selected account.
 * 
 * @returns {Object} The selected authenticated account.
 */
exports.setSelectedAccount = function (uuid) {
    const authAcc = config.accounts[uuid]
    if (authAcc != null) {
        config.selectedAccount = uuid
    }
    return authAcc
}



// User Configurable Settings

// Java Settings

/**
 * Retrieve the minimum amount of memory for JVM initialization. This value
 * contains the units of memory. For example, '5G' = 5 GigaBytes, '1024M' = 
 * 1024 MegaBytes, etc.
 * 
 * @param {boolean} def Optional. If true, the default value will be returned.
 * @returns {string} The minimum amount of memory for JVM initialization.
 */
exports.getMinRAM = function (def = false) {
    return !def ? config.settings.java.minRAM : DEFAULT_CONFIG.settings.java.minRAM
}

/**
 * Set the minimum amount of memory for JVM initialization. This value should
 * contain the units of memory. For example, '5G' = 5 GigaBytes, '1024M' = 
 * 1024 MegaBytes, etc.
 * 
 * @param {string} minRAM The new minimum amount of memory for JVM initialization.
 */
exports.setMinRAM = function (minRAM) {
    config.settings.java.minRAM = minRAM
}

/**
 * Retrieve the maximum amount of memory for JVM initialization. This value
 * contains the units of memory. For example, '5G' = 5 GigaBytes, '1024M' = 
 * 1024 MegaBytes, etc.
 * 
 * @param {boolean} def Optional. If true, the default value will be returned.
 * @returns {string} The maximum amount of memory for JVM initialization.
 */
exports.getMaxRAM = function (def = false) {
    return !def ? config.settings.java.maxRAM : resolveMaxRAM()
}

/**
 * Set the maximum amount of memory for JVM initialization. This value should
 * contain the units of memory. For example, '5G' = 5 GigaBytes, '1024M' = 
 * 1024 MegaBytes, etc.
 * 
 * @param {string} maxRAM The new maximum amount of memory for JVM initialization.
 */
exports.setMaxRAM = function (maxRAM) {
    config.settings.java.maxRAM = maxRAM
}




/**
 * Check if auto authentication is enabled or not
 * 
 * @returns {boolean} Whether or not the launcher automatically authenticates the player.
 */
exports.isAutoAuthEnabled = function () {
    return config.autoAuth
}

/**
 * Set auto authentication enabled or not
 * 
 * @param {boolean} autoAuth Whether or not the launcher automatically authenticates the player.
 */
exports.setAutoAuthEnabled = function (autoAuth) {
    config.autoAuth = autoAuth
}

/**
 * Check if keep launcher open is enabled or not
 * 
 * @returns {boolean} Whether or not the launcher closes after starting the game.
 */
exports.isKeepLauncherOpenEnabled = function () {
    return config.settings.launcher.keepLauncherOpen
}

/**
 * Set keep launcher open enabled or not
 * 
 * @param {boolean} keepLauncherOpen Whether or not the launcher closes after starting the game.
 */
exports.setKeepLauncherOpenEnabled = function (keepLauncherOpen) {
    config.settings.launcher.keepLauncherOpen = keepLauncherOpen
}
