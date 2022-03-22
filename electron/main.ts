import { app, BrowserWindow } from "electron";
import * as path from "path";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

const LAUNCHER_NAME = "ReactMCLauncher";

function createWindow() {
  const win = new BrowserWindow({
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
    win.loadURL("http://localhost:3000/index.html");
  }
}

app.whenReady().then(() => {
  // DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));

  createWindow();

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
