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

type AppInitEvent = {
  type: "init";
};

type AppOnboardingEvent =
  | {
      type: "onboarding_xout";
    }
  | {
      type: "onboarding_complete";
      path: string;
    };

type AppRunningEvent = { type: "open_composer" };

type AppComposingEvent =
  | { type: "close_composer" }
  | { type: "create_log"; text: string };

type AppEvent =
  | AppInitEvent
  | AppOnboardingEvent
  | AppRunningEvent
  | AppComposingEvent;

let appState: AppState = {
  type: "init",
};

function handleAppEvent(event: AppEvent) {
  console.log("Event: ", event);
  appState = reduce(appState, event);
  console.log("State:", appState);
}

function reduce(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case "init":
      assertStateType(state, "init", event.type);
      return reduceInitState(state, event);
    case "onboarding_xout":
    case "onboarding_complete":
      assertStateType(state, "onboarding", event.type);
      return reduceOnboardingState(state, event);
    case "open_composer":
      assertStateType(state, "running", event.type);
      return reduceRunningState(state, event);
    case "close_composer":
    case "create_log":
      assertStateType(state, "composing", event.type);
      return reduceComposingState(state, event);
  }
}

function assertStateType<T extends AppState["type"]>(
  state: AppState,
  expected: T,
  eventType: AppEvent["type"]
): asserts state is Extract<AppState, { type: T }> {
  if (state.type != expected) {
    throw new Error(
      `Event '${eventType}' cannot be fired in the '${state.type}' state`
    );
  }
}

function reduceInitState(state: AppInitState, event: AppInitEvent): AppState {
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
    handleAppEvent({ type: "onboarding_xout" });
  });

  ipcMain.once("onboarding-complete", (event, result) => {
    const path: string = result.path;
    handleAppEvent({
      type: "onboarding_complete",
      path,
    });
  });

  return {
    type: "onboarding",
    window,
  };
}

function reduceOnboardingState(
  state: AppOnboardingState,
  event: AppOnboardingEvent
): AppState {
  switch (event.type) {
    case "onboarding_xout":
      return close();
    case "onboarding_complete":
      state.window.removeAllListeners();
      closeWindow(state.window);
      return startRunning({
        path: event.path,
      });
  }
}

function close(): AppClosingState {
  app.exit();
  return {
    type: "closing",
  };
}

function startRunning(state: Omit<AppRunningState, "type" | "tray">): AppState {
  const tray = new Tray(path.join(__static, "tray.png"));
  const menu = Menu.buildFromTemplate([{ role: "quit" }]);
  tray.setToolTip("RaLo");
  tray.setContextMenu(menu);

  if (
    !globalShortcut.register("CmdOrCtrl+\\", () =>
      handleAppEvent({ type: "open_composer" })
    )
  ) {
    // TODO: Notify the user
    return close();
  }
  return { ...state, type: "running", tray };
}

function reduceRunningState(
  state: AppRunningState,
  event: AppRunningEvent
): AppState {
  switch (event.type) {
    case "open_composer":
      const window = new BrowserWindow({
        webPreferences: { enableRemoteModule: true, nodeIntegration: true },
        width: 800,
        height: 72,
        useContentSize: true,
        frame: false,
      });

      window.on("closed", () => {
        handleAppEvent({ type: "close_composer" });
      });

      ipcMain.on("resize", (e, bounds) => {
        window.setSize(800, bounds.height, false);
        window.center();
      });

      ipcMain.once("create_log", (_, { text }) => {
        handleAppEvent({ type: "create_log", text });
      });

      const url = getRouteURL("composer");
      window.loadURL(url);

      maybeEnableWindowDevMode(window);

      return {
        ...state,
        type: "composing",
        window,
      };
  }
}

function reduceComposingState(
  state: AppComposingState,
  event: AppComposingEvent
): AppState {
  switch (event.type) {
    case "close_composer":
      ipcMain.removeAllListeners();
      return {
        type: "running",
        path: state.path,
        tray: state.tray,
      };
    case "create_log":
      ipcMain.removeAllListeners();
      state.window.removeAllListeners();
      closeWindow(state.window);
      return {
        type: "running",
        path: state.path,
        tray: state.tray,
      };
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

app.whenReady().then(() => {
  // handleAppEvent({ type: "init" });

  appState = startRunning({ path: "." });
  handleAppEvent({ type: "open_composer" });
});

// Don't stop when the windows close
app.on("window-all-closed", (e: Event) => e.preventDefault());

// Unregister the shortcut so we don't keep it when we no longer need it
app.on("will-quit", () => globalShortcut.unregisterAll());
