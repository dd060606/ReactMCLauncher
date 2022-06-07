import fs from "fs-extra";
import os from "os";
import path from "path";
import { app } from "electron";
import axios from "axios";
import Logger from "./logger";

import type { Profile } from "./authmanager";

// Launcher global constants
export const LAUNCHER_CONFIG =
  "https://dd06-dev.fr/dl/launchers/react-mc-launcher/launcher_config.json";
export const LAUNCHER_NAME = "ReactMCLauncher";
export const MC_VERSION = "1.12.2";
export const FORGE_VERSION = "14.23.5.2855";
export const JRE_WINDOWS = "https://dd06-dev.fr/dl/jre/jre-windows.zip";
export const JRE_LINUX = "https://dd06-dev.fr/dl/jre/jre-linux.zip";
export const MODS_URL = "";

const sysRoot =
  process.env.APPDATA ||
  (process.platform == "darwin"
    ? process.env.HOME + "/Library/Application Support"
    : process.env.HOME);
const dataPath = path.join(sysRoot as string, LAUNCHER_NAME);
const gamePath = path.join(sysRoot as string, `.${LAUNCHER_NAME}`);

const launcherDir = process.env.CONFIG_DIRECT_PATH || app.getPath("userData");

const logger = new Logger("[ConfigManager]");

type AuthType = "microsoft" | "offline";

type Config = {
  settings: {
    java: {
      minRAM: string;
      maxRAM: string;
    };
    launcher: {
      dataDirectory: string;
      keepLauncherOpen: boolean;
    };
  };
  clientToken: null | string;
  autoAuth: boolean;
  accounts?: {
    [key: string]: Profile & { authType: AuthType };
  };
  selectedAccount?: string;
};
export type DynaConfig = {
  maintenance: boolean;
  maintenanceMessage: string;
  news: string;
  serverPort: number;
  serverIP: string;
  youtube: string;
  discord: string;
  twitter: string;
  web: string;
};

const DEFAULT_CONFIG: Config = {
  settings: {
    java: {
      minRAM: resolveMinRAM(),
      maxRAM: resolveMaxRAM(),
    },
    launcher: {
      dataDirectory: dataPath,
      keepLauncherOpen: false,
    },
  },
  clientToken: null,
  autoAuth: true,
  accounts: {},
};
const configPath = path.join(getLauncherDirectory(), "config.json");
const configPathLEGACY = path.join(dataPath, "config.json");

let config: Config | null = null;

let dynamicConfig: DynaConfig | null = null;

/**
 * Retrieve the absolute path of the launcher directory.
 *
 * @returns {string} The absolute path of the launcher directory.
 */
export function getLauncherDirectory() {
  return launcherDir;
}

/**
 * Retrieve the absolute path of the game directory.
 *
 * @returns {string} The absolute path of the game directory.
 */
export function getGameDirectory() {
  if (!fs.existsSync(gamePath)) {
    fs.mkdirSync(gamePath, { recursive: true });
  }
  return gamePath;
}

/**
 * Retrieve the absolute path of the launcher directory.
 *
 * @returns {string} The absolute path of the launcher directory.
 */
export function getDataDirectory(def: boolean = false) {
  return !def
    ? config?.settings.launcher.dataDirectory
    : DEFAULT_CONFIG.settings.launcher.dataDirectory;
}

export function getDynamicConfig() {
  return dynamicConfig;
}
export function loadDynamicConfig() {
  axios
    .get(LAUNCHER_CONFIG)
    .then((res) => {
      dynamicConfig = res.data as DynaConfig;
    })
    .catch((err: Error) => {
      logger.error(err.message);
    });
}

// Persistance Utility Functions

/**
 * Save the current configuration to a file.
 */
export function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 4), {
    encoding: "utf8",
  });
}

function getAbsoluteMinRAM() {
  const mem = os.totalmem();
  return mem >= 6000000000 ? 3 : 2;
}

function getAbsoluteMaxRAM() {
  const mem = os.totalmem();
  const gT16 = mem - 16000000000;
  return Math.floor(
    (mem - 1000000000 - (gT16 > 0 ? gT16 / 8 + 16000000000 / 4 : mem / 4)) /
      1000000000
  );
}

function resolveMaxRAM() {
  const mem = os.totalmem();
  return mem >= 8000000000 ? "4G" : mem >= 6000000000 ? "3G" : "2G";
}
function resolveMinRAM() {
  return resolveMaxRAM();
}

/**
 * Load the configuration into memory. If a configuration file exists,
 * that will be read and saved. Otherwise, a default configuration will
 * be generated. Note that "resolved" values default to null and will
 * need to be externally assigned.
 */
export function load() {
  let doLoad = true;

  if (!fs.existsSync(configPath)) {
    fs.ensureDirSync(path.join(configPath, ".."));
    if (fs.existsSync(configPathLEGACY)) {
      fs.moveSync(configPathLEGACY, configPath);
    } else {
      doLoad = false;
      config = DEFAULT_CONFIG;
      saveConfig();
    }
  }
  if (doLoad) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }));
    } catch (err) {
      logger.log("Configuration file contains malformed JSON or is corrupt.");
      logger.log("Generating a new configuration file.");
      fs.ensureDirSync(path.join(configPath, ".."));
      config = DEFAULT_CONFIG;
      saveConfig();
    }
  }
  logger.log("Successfully loaded!");
}

/**
 * Retrieve the launcher's Client Token.
 * There is no default client token.
 *
 * @returns {string} The launcher's Client Token.
 */
export function getClientToken() {
  return config?.clientToken;
}

/**
 * Set the launcher's Client Token.
 *
 * @param {string} clientToken The launcher's new Client Token.
 */
export function setClientToken(clientToken: string) {
  if (config) {
    config.clientToken = clientToken;
  }
}

/**
 * Get an array of each account currently authenticated by the launcher.
 *
 * @returns {Array.<Object>} An array of each stored authenticated account.
 */
export function getAuthAccounts() {
  return config?.accounts;
}

/**
 * Returns the authenticated account with the given uuid. Value may
 * be null.
 *
 * @param {string} uuid The uuid of the authenticated account.
 * @returns {Object} The authenticated account with the given uuid.
 */
export function getAuthAccount(uuid: string) {
  if (config?.accounts) {
    return config.accounts[uuid];
  } else {
    return null;
  }
}

/**
 * Adds an authenticated account to the database to be stored.
 *
 * @param {Profile} profile The profile object of the authenticated account.
 * @param {string} authType The auth type of the authenticated account.
 *
 * @returns {Object} The authenticated account object created by this action.
 */
export function addAuthAccount(
  profile: Profile,
  authType: AuthType = "microsoft"
) {
  if (config && profile._msmc) {
    config.selectedAccount = profile.id;
    if (!config.accounts) {
      config.accounts = {};
    }
    config.accounts[profile.id] = {
      authType: authType,
      _msmc: {
        mcToken: profile._msmc.mcToken,
        refresh: profile._msmc.refresh,
        expires_by: profile._msmc.expires_by,
      },
      name: profile.name,
      xuid: profile.xuid,
      id: profile.id,
    };
    return config.accounts[profile.id];
  } else {
    return null;
  }
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
export function removeAuthAccount(uuid: string) {
  if (config?.accounts && config.accounts[uuid] != null) {
    delete config.accounts[uuid];
    if (config.selectedAccount === uuid) {
      const keys = Object.keys(config.accounts);
      if (keys.length > 0) {
        config.selectedAccount = keys[0];
      } else {
        config.selectedAccount = undefined;
        config.clientToken = null;
      }
    }
    return true;
  }
  return false;
}

/**
 * Get the currently selected authenticated account.
 *
 * @returns {Object} The selected authenticated account.
 */
export function getSelectedAccount() {
  if (config?.accounts !== undefined && config.selectedAccount !== undefined) {
    return config?.accounts[config.selectedAccount];
  } else {
    return null;
  }
}

/**
 * Set the selected authenticated account.
 *
 * @param {string} uuid The UUID of the account which is to be set
 * as the selected account.
 *
 * @returns {Object} The selected authenticated account.
 */
export function setSelectedAccount(uuid: string) {
  if (config?.accounts) {
    const authAcc = config.accounts[uuid];
    if (authAcc != null) {
      config.selectedAccount = uuid;
    }
    return authAcc;
  } else {
    return null;
  }
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
export function getMinRAM(def: boolean = false) {
  if (config) {
    return !def
      ? config.settings.java.minRAM
      : DEFAULT_CONFIG.settings.java.minRAM;
  } else {
    return null;
  }
}

/**
 * Set the minimum amount of memory for JVM initialization. This value should
 * contain the units of memory. For example, '5G' = 5 GigaBytes, '1024M' =
 * 1024 MegaBytes, etc.
 *
 * @param {string} minRAM The new minimum amount of memory for JVM initialization.
 */
export function setMinRAM(minRAM: string) {
  if (config) {
    config.settings.java.minRAM = minRAM;
  }
}

/**
 * Retrieve the maximum amount of memory for JVM initialization. This value
 * contains the units of memory. For example, '5G' = 5 GigaBytes, '1024M' =
 * 1024 MegaBytes, etc.
 *
 * @param {boolean} def Optional. If true, the default value will be returned.
 * @returns {string} The maximum amount of memory for JVM initialization.
 */
export function getMaxRAM(def: boolean = false) {
  return !def ? config?.settings.java.maxRAM : resolveMaxRAM();
}

/**
 * Set the maximum amount of memory for JVM initialization. This value should
 * contain the units of memory. For example, '5G' = 5 GigaBytes, '1024M' =
 * 1024 MegaBytes, etc.
 *
 * @param {string} maxRAM The new maximum amount of memory for JVM initialization.
 */
export function setMaxRAM(maxRAM: string) {
  if (config) {
    config.settings.java.maxRAM = maxRAM;
  }
}

/**
 * Check if auto authentication is enabled or not
 *
 * @returns {boolean} Whether or not the launcher automatically authenticates the player.
 */
export function isAutoAuthEnabled() {
  return config?.autoAuth;
}

/**
 * Set auto authentication enabled or not
 *
 * @param {boolean} autoAuth Whether or not the launcher automatically authenticates the player.
 */
export function setAutoAuthEnabled(autoAuth: boolean) {
  if (config) {
    config.autoAuth = autoAuth;
  }
}

/**
 * Check if keep launcher open is enabled or not
 *
 * @returns {boolean} Whether or not the launcher closes after starting the game.
 */
export function isKeepLauncherOpenEnabled() {
  return config?.settings.launcher.keepLauncherOpen;
}

/**
 * Set keep launcher open enabled or not
 *
 * @param {boolean} keepLauncherOpen Whether or not the launcher closes after starting the game.
 */
export function setKeepLauncherOpenEnabled(keepLauncherOpen: boolean) {
  if (config) {
    config.settings.launcher.keepLauncherOpen = keepLauncherOpen;
  }
}
