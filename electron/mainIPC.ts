import { ipcMain as ipc, shell } from "electron";
import { win } from "./main";

import Logger from "./utils/logger";
import os from "os";

import type { DynaConfig } from "./utils/configmanager";
import { ping } from "minecraft-server-ping";

import type * as ConfigManagerTypes from "./utils/configmanager";
//Global module
const configManager: typeof ConfigManagerTypes = require("./utils/configmanager");
const logger = new Logger("[Launcher]");

function initMainIPC() {
  //Async utils
  ipc.on("open-link", (event, args) => shell.openExternal(args));
  ipc.on("ping-server", () => {
    if (configManager?.getDynamicConfig()) {
      ping(
        (configManager.getDynamicConfig() as DynaConfig).serverIP,
        (configManager.getDynamicConfig() as DynaConfig).serverPort
      )
        .then((res) => win?.webContents.send("ping-server-result", res))
        .catch((err) => {
          logger.warn("Unable to refresh server status, assuming offline.");
          logger.debug(err);
          win?.webContents.send("ping-server-result", false);
        });
    }
  });
  ipc.on("set-memory", (event, args) => {
    const memory = args + "G";
    configManager.setMinRAM(memory);
    configManager.setMaxRAM(memory);
    configManager.saveConfig();
  });
  ipc.on("set-auto-auth", (event, args) => {
    configManager.setAutoAuthEnabled(args);
    configManager.saveConfig();
  });
  ipc.on("set-keep-launcher-open", (event, args) => {
    configManager.setKeepLauncherOpenEnabled(args);
    configManager.saveConfig();
  });
  ipc.on("open-game-dir", () =>
    shell.openPath(configManager.getGameDirectory())
  );

  //Sync utils
  ipc.on("get-launcher-name", (event) => {
    event.returnValue = configManager.LAUNCHER_NAME;
  });
  ipc.on("get-platform-name", (event) => {
    event.returnValue = process.platform;
  });
  ipc.on("get-dynamic-config", (event) => {
    event.returnValue = configManager.getDynamicConfig();
  });
  ipc.on("available-memory", (event) => {
    const mem = os.totalmem() / 1000000000;
    event.returnValue = +mem.toFixed(0) - 1;
  });
  ipc.on("get-memory", (event) => {
    if (configManager && configManager.getMinRAM()) {
      event.returnValue = parseInt(
        (configManager.getMinRAM() as string).replace("G", "")
      );
    } else {
      event.returnValue = 0;
    }
  });

  ipc.on("is-keep-launcher-open", (event) => {
    event.returnValue = configManager.isKeepLauncherOpenEnabled();
  });
  ipc.on("is-auto-auth", (event) => {
    event.returnValue = configManager.isAutoAuthEnabled();
  });

  //Frame buttons
  ipc.on("close-app", () => {
    win?.close();
  });
  ipc.on("minimize-app", () => {
    win?.minimize();
  });
  ipc.on("maximize-app", () => {
    if (win?.isMaximized()) {
      win?.unmaximize();
    } else {
      win?.maximize();
    }
  });
}

export { initMainIPC };
