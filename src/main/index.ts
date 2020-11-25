if (module.hot) {
  module.hot.accept();
}

import { Tray, Menu, app, BrowserWindow, globalShortcut } from "electron";
import ipcMain from "@/ipcMain";
import { getRouteURL } from "common/router";
import isDev from "common/isDev";
import * as pathUtils from "path";
import closeWindow from "common/closeWindow";
import { assertState, getState, setState } from "./AppState";

app.whenReady().then(() => {
  init();
});

// Don't stop when the windows close
app.on("window-all-closed", (e: Event) => e.preventDefault());

// Unregister the shortcut so we don't keep it when we no longer need it
app.on("will-quit", () => globalShortcut.unregisterAll());

function init() {
  assertState("init");

  const window = new BrowserWindow({
    webPreferences: { enableRemoteModule: true, nodeIntegration: true },
    width: 800,
    height: 600,
    icon: pathUtils.join(__static, "icon.png"),
    useContentSize: true,
    frame: isDev,
  });

  const url = getRouteURL("onboarding");
  window.loadURL(url);

  maybeEnableWindowDevMode(window);

  window.on("closed", () => {
    closeApp();
  });

  ipcMain.once("onboarding_complete", (event, result) => {
    completeOnboarding(result.path);
  });

  setState({
    type: "onboarding",
    window,
  });
}

function maybeEnableWindowDevMode(window: BrowserWindow) {
  if (!isDev) {
    return;
  }

  window.webContents.openDevTools({ mode: "detach" });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });
}

function closeApp() {
  app.exit();
  setState({
    type: "closing",
  });
}

function completeOnboarding(path: string) {
  const state = assertState("onboarding");
  state.window.removeAllListeners();
  closeWindow(state.window);
  startRunning(path);
}

function startRunning(path: string) {
  const tray = new Tray(pathUtils.join(__static, "tray.png"));
  const menu = Menu.buildFromTemplate([{ role: "quit" }]);
  tray.setToolTip("RaLo");
  tray.setContextMenu(menu);

  if (
    !globalShortcut.register("CmdOrCtrl+\\", () => {
      const state = getState();
      if (state.type === "running") {
        openComposer();
      }
    })
  ) {
    return closeApp();
  }

  setState({ path, type: "running", tray });
}

function openComposer() {
  const state = assertState("running");
  const window = new BrowserWindow({
    webPreferences: { enableRemoteModule: true, nodeIntegration: true },
    width: 800,
    height: 72,
    useContentSize: true,
    frame: false,
  });

  ipcMain.on("resize", (e, bounds) => {
    window.setSize(800, bounds.height, false);
    window.center();
  });

  ipcMain.once("create_log", (_, { text }) => {
    const state = assertState("composing");
    ipcMain.removeAllListeners();
    state.window.removeAllListeners();
    closeWindow(state.window);
    setState({
      type: "running",
      path: state.path,
      tray: state.tray,
    });
  });

  window.on("closed", () => {
    const state = assertState("composing");
    ipcMain.removeAllListeners();
    setState({
      type: "running",
      path: state.path,
      tray: state.tray,
    });
  });

  const url = getRouteURL("composer");
  window.loadURL(url);

  // maybeEnableWindowDevMode(window);

  setState({
    ...state,
    type: "composing",
    window,
  });
}
