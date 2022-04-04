import * as msmc from "msmc";
import type { profile } from "msmc";
import Logger from "./logger";
import { win } from "../main";
import * as configManager from "./configmanager";

export type Profile = profile & {
  _msmc?: { refresh: string; expires_by: number; mcToken: string };
};

const logger = new Logger("[AuthManager]");

export async function addMicrosoftAccount() {
  msmc
    .fastLaunch("electron", (update) => {
      //A hook for catching loading bar events and errors, standard with MSMC
      if (update.data) {
        logger.log(update.data);
      }
    })
    .then((result) => {
      //Let's check if we logged in?
      if (msmc.errorCheck(result)) {
        if (result.reason) {
          win?.webContents.send("microsoft-auth-err", result.reason);
          logger.error(result.reason);
        }
        return;
      }
      if (result) {
        //If the login works
        const profile: Profile | undefined = result.profile;

        if (profile && profile._msmc) {
          logger.log("Successfully authenticated to microsoft!");
          configManager.addAuthAccount(profile, "microsoft");
          configManager.saveConfig();

          win?.webContents.send("auth-success");
        }
      }
    })
    .catch((reason: string) => {
      //If the login fails
      logger.error("Error while logging in : " + reason);
      win?.webContents.send("microsoft-auth-err", reason);
    });
}

export async function validateAccount(profile: Profile): Promise<boolean> {
  if (msmc.validate(profile)) {
    const result: msmc.result = await msmc.refresh(profile);
    if (result.profile) {
      configManager.addAuthAccount(result.profile, "microsoft");
      configManager.saveConfig();
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
