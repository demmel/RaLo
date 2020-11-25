import { BrowserWindow } from "electron";

function closeWindow(window: BrowserWindow) {
  if (window.webContents.isDevToolsOpened()) {
    window.webContents.closeDevTools();
  }
  window.close();
}

export default closeWindow;
