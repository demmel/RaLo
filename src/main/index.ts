if (module.hot) {
  module.hot.accept();
}

import { app, BrowserWindow } from "electron";
import { getRouteURL } from "common/router";
import isDev from "common/isDev";
import * as path from "path";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;

function createMainWindow() {
  const window = new BrowserWindow({
    webPreferences: { enableRemoteModule: true, nodeIntegration: true },
    width: 500,
    height: 600,
    icon: path.join(__static, "icon.png"),
  });

  if (isDev) {
    window.webContents.openDevTools();
  }

  const url = getRouteURL("onboarding");
  window.loadURL(url);

  window.on("closed", () => {
    mainWindow = null;
  });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

app.whenReady().then(() => {
  mainWindow = createMainWindow();
});
