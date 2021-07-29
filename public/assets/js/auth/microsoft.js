/**
 * Microsoft
 *
 * This module serves as a minimal wrapper for Microsoft api.
 *
 * @module microsoft
 */

exports.MICROSOFT_OAUTH2_URL = "https://login.live.com/oauth20_authorize.srf"
exports.MICROSOFT_OAUTH2_DESKTOP = "https://login.live.com/oauth20_desktop.srf"
exports.MICROSOFT_CLIENT_ID = "00000000402b5328"
exports.MICROSOFT_AUTH_TOKEN_URL = "https://login.live.com/oauth20_token.srf"
exports.XBL_AUTH_URL = "https://user.auth.xboxlive.com/user/authenticate"
exports.XSTS_AUTH_URL = "https://xsts.auth.xboxlive.com/xsts/authorize"
exports.MC_LOGIN_URL = "https://api.minecraftservices.com/authentication/login_with_xbox"
exports.MC_PROFILE_URL = "https://api.minecraftservices.com/minecraft/profile"

const logger = require('../logger')('%c[Microsoft]', 'color: #a02d2a; font-weight: bold')
const axios = require("axios")
/**
 * Authenticate a user with their Microsoft credentials.
 * 
 * @param {string} authCode The user's authentification code
 *
 */
exports.authenticate = async function (authCode) {

    const postParams = new URLSearchParams()
    postParams.append("client_id", exports.MICROSOFT_CLIENT_ID)
    postParams.append("code", authCode)
    postParams.append("grant_type", "authorization_code")
    postParams.append("redirect_uri", exports.MICROSOFT_OAUTH2_DESKTOP)
    postParams.append("scope", "service::user.auth.xboxlive.com::MBI_SSL")
    logger.log("Authentificating to microsoft...")
    try {
        const res = await axios.post(exports.MICROSOFT_AUTH_TOKEN_URL, postParams,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
        const xblToken = await acquireXBLToken(res.data.access_token)
        const xsts = await acquireXsts(xblToken)
        const minecraftToken = await acquireMinecraftToken(xsts.uhs, xsts.token)
        const minecraftProfile = await checkMcProfile(minecraftToken)
        return minecraftProfile
    }
    catch (err) {
        throw new Error(err)
    }
}

async function acquireXBLToken(accessToken) {

    logger.log("Getting XBL Token...")
    try {
        const res = await axios.post(exports.XBL_AUTH_URL, {
            "Properties": {
                "AuthMethod": "RPS",
                "SiteName": "user.auth.xboxlive.com",
                "RpsTicket": `d=${accessToken}`
            },
            "RelyingParty": "http://auth.xboxlive.com",
            "TokenType": "JWT"
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
        })
        return res.data.Token
    } catch (err) {
        throw new Error(err)
    }
}
async function acquireXsts(token) {
    logger.log("Getting Xbox live token and user hash...")

    try {
        const res = await axios.post(exports.XSTS_AUTH_URL, {
            Properties: {
                SandboxId: "RETAIL",
                UserTokens: [
                    token
                ]
            },
            RelyingParty: "rp://api.minecraftservices.com/",
            TokenType: "JWT"
        })
        return { uhs: res.data.DisplayClaims.xui[0].uhs, token: res.data.Token }
    } catch (err) {
        throw new Error(err)
    }



}
async function acquireMinecraftToken(xblUhs, xblXsts) {
    logger.log("Getting Minecraft token...")

    try {
        const res = await axios.post(exports.MC_LOGIN_URL, {
            identityToken: `XBL3.0 x=${xblUhs};${xblXsts}`
        })
        return res.data.access_token
    } catch (err) {
        throw new Error(err)
    }



}

async function checkMcProfile(mcAccessToken) {
    logger.log("Checking Minecraft profile...")
    try {
        const res = await axios.get(exports.MC_PROFILE_URL, {}, {
            headers: {
                "Authorization": "Bearer " + mcAccessToken
            }
        })
        return { id: res.data.id, name: res.data.name, accessToken: mcAccessToken }
    } catch (err) {
        throw new Error(err)
    }
}