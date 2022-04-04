import { contextBridge, ipcRenderer } from "electron";

import Logger from "./utils/logger";

const logger = new Logger("[Preload]");
logger.log("Loading...");

contextBridge.exposeInMainWorld("ipc", {
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data);
  },
  sendSync: (channel: string, data?: any) => {
    return ipcRenderer.sendSync(channel, data);
  },
  receive: (channel: string, func: (...datas: any) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
