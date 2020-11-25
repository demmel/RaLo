if (module.hot) {
  module.hot.accept();
}

import {
  Tray,
  Menu,
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
} from "electron";
import { getRouteURL } from "common/router";
import isDev from "common/isDev";
import * as path from "path";
import closeWindow from "common/closeWindow";

type AppInitState = {
  type: "init";
};

type AppOnboardingState = {
  type: "onboarding";
  window: BrowserWindow;
};

type AppRunningState = {
  type: "running";
  path: string;
  tray: Tray;
};

type AppComposingState = {
  type: "composing";
  window: BrowserWindow;
  path: string;
  tray: Tray;
};

type AppClosingState = { type: "closing" };

type AppState =
  | AppInitState
  | AppOnboardingState
  | AppRunningState
  | AppComposingState
  | AppClosingState;

let appState: AppState = {
  type: "init",
};

app.whenReady().then(() => {
  init();
});

// Don't stop when the windows close
app.on("window-all-closed", (e: Event) => e.preventDefault());

// Unregister the shortcut so we don't keep it when we no longer need it
app.on("will-quit", () => globalShortcut.unregisterAll());

function init() {
  assertStateType(appState, "init");
  const window = new BrowserWindow({
    webPreferences: { enableRemoteModule: true, nodeIntegration: true },
    width: 800,
    height: 600,
    icon: path.join(__static, "icon.png"),
    useContentSize: true,
    frame: isDev,
  });

  const url = getRouteURL("onboarding");
  window.loadURL(url);

  maybeEnableWindowDevMode(window);

  window.on("closed", () => {
    closeApp();
  });

  ipcMain.once("onboarding-complete", (event, result) => {
    completeOnboarding(result.path);
  });

  appState = {
    type: "onboarding",
    window,
  };
}

function assertStateType<T extends AppState["type"]>(
  state: AppState,
  expected: T
): asserts state is Extract<AppState, { type: T }> {
  if (state.type != expected) {
    throw new Error(
      `Event '${assertStateType.caller.name}' expected '${expected}' state type but state type is currently '${state.type}'`
    );
  }
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
  appState = {
    type: "closing",
  };
}

function completeOnboarding(path: string) {
  assertStateType(appState, "onboarding");
  appState.window.removeAllListeners();
  closeWindow(appState.window);
  startRunning({
    path,
  });
}

function startRunning(state: Omit<AppRunningState, "type" | "tray">) {
  const tray = new Tray(path.join(__static, "tray.png"));
  const menu = Menu.buildFromTemplate([{ role: "quit" }]);
  tray.setToolTip("RaLo");
  tray.setContextMenu(menu);

  if (!globalShortcut.register("CmdOrCtrl+\\", () => openComposer())) {
    return closeApp();
  }

  appState = { ...state, type: "running", tray };
}

function openComposer() {
  assertStateType(appState, "running");
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
    assertStateType(appState, "composing");
    ipcMain.removeAllListeners();
    appState.window.removeAllListeners();
    closeWindow(appState.window);
    appState = {
      type: "running",
      path: appState.path,
      tray: appState.tray,
    };
  });

  window.on("closed", () => {
    assertStateType(appState, "composing");
    ipcMain.removeAllListeners();
    appState = {
      type: "running",
      path: appState.path,
      tray: appState.tray,
    };
  });

  const url = getRouteURL("composer");
  window.loadURL(url);

  maybeEnableWindowDevMode(window);

  appState = {
    ...appState,
    type: "composing",
    window,
  };
}
