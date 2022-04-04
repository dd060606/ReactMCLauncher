import { app, BrowserWindow, ipcMain as ipc } from "electron";
import * as path from "path";
import isDev from "electron-is-dev";
import { initMainIPC } from "./mainIPC";

import * as configManager from "./utils/configmanager";

import { autoUpdater } from "electron-updater";
import { initAuth } from "./auth";
import log from "electron-log";
console.log = log.log;
autoUpdater.logger = log;

const LAUNCHER_NAME = "ReactMCLauncher";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 729,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    title: LAUNCHER_NAME,
    icon: path.join(__dirname, "..", "..", "public", "assets", "logo.png"),
  });
  if (app.isPackaged) {
    win.loadURL(`file://${__dirname}/../index.html`);
  } else {
    win.loadURL("http://localhost:3000");
  }
}

app.whenReady().then(() => {
  configManager.load();
  createWindow();
  configManager.loadDynamicConfig();
  setInterval(function () {
    configManager.loadDynamicConfig();
  }, 15000);
  initMainIPC();
  initAuth();
  //game.init();
  console.log("Launcher version: " + app.getVersion());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});

ipc.on("install-updates", () => {
  autoUpdater.quitAndInstall();
});
ipc.on("check-auto-update", () => {
  if (isDev) {
    autoUpdater.updateConfigPath = path.join(__dirname, "dev-app-update.yml");
    win?.webContents.send("launcher-update-finished", false);
    return;
  }

  if (process.platform === "darwin") {
    autoUpdater.autoDownload = false;
  }
  autoUpdater.allowPrerelease = true;
  autoUpdater.on("update-downloaded", () => {
    win?.webContents.send("launcher-update-finished", true);
  });
  autoUpdater.on("update-available", () => {
    if (process.platform === "darwin") {
      win?.webContents.send("update-available-mac");
    }
  });
  autoUpdater.on("update-not-available", () => {
    win?.webContents.send("launcher-update-finished", false);
  });
  autoUpdater.on("error", (err: Error) => {
    win?.webContents.send("launcher-update-error", err.message);
  });
  autoUpdater.on("download-progress", (progress) => {
    win?.webContents.send(
      "set-launcher-update-progress",
      progress.percent.toFixed(2)
    );
  });
  autoUpdater.checkForUpdates().catch((err: Error) => {
    win?.webContents.send("launcher-update-error", err.message);
  });
});

export { win };
