import { createTypedIpcMain } from "common/ipc";
import { IpcEvents } from "common/ipcEvents";
import { ipcMain } from "electron";

export default createTypedIpcMain<IpcEvents>(ipcMain);
