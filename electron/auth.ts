import { ipcMain as ipc } from "electron";
import * as authManager from "./utils/authmanager";
import * as configManager from "./utils/configmanager";
import { win } from "./main";
import Logger from "./utils/logger";

const logger = new Logger("[AuthManager]");

export function initAuth() {
  ipc.on("microsoft-login", (event, args) => {
    configManager.setAutoAuthEnabled(true);
    configManager.saveConfig();
    authManager.addMicrosoftAccount();
  });
  ipc.on("auto-auth", async () => {
    if (configManager.isAutoAuthEnabled()) {
      const selectedAcc = configManager.getSelectedAccount();
      if (selectedAcc) {
        const isValid = await authManager.validateAccount(selectedAcc);
        if (!isValid) {
          configManager.removeAuthAccount(selectedAcc.id);
          configManager.saveConfig();
          logger.error("Failed to refresh login!");
          win?.webContents.send("auto-auth-response", false);
        } else {
          logger.log("Sucessfully authenticated!");
          win?.webContents.send("auto-auth-response", true);
        }
      } else {
        logger.error("Failed to refresh login!");
        win?.webContents.send("auto-auth-response", false);
      }
    } else {
      win?.webContents.send("auto-auth-response", false);
    }
  });

  ipc.on("logout", () => {
    configManager.setAutoAuthEnabled(false);
    const uuid = configManager?.getSelectedAccount()?.id;
    if (uuid) {
      configManager.removeAuthAccount(uuid);
    }
    configManager.saveConfig();
  });

  ipc.on("get-player-name", (event) => {
    event.returnValue = configManager.getSelectedAccount()?.name;
  });
  ipc.on("get-player-uuid", (event) => {
    event.returnValue = configManager.getSelectedAccount()?.id;
  });
}
