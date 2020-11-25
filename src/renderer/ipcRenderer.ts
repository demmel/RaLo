import { createTypedIpcRenderer } from "common/ipc";
import { IpcEvents } from "common/ipcEvents";
import { ipcRenderer } from "electron";

export default createTypedIpcRenderer<IpcEvents>(ipcRenderer);
