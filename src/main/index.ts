if (module.hot) {
  module.hot.accept();
}

import { Tray, Menu, app, BrowserWindow, ipcMain } from "electron";
import { getRouteURL } from "common/router";
import isDev from "common/isDev";
import * as path from "path";

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

type AppClosingState = { type: "closing" };

type AppState =
  | AppInitState
  | AppOnboardingState
  | AppRunningState
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

type AppEvent = AppInitEvent | AppOnboardingEvent;

let appState: AppState = {
  type: "init",
};

function handleAppEvent(event: AppEvent) {
  appState = reduce(appState, event);
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

  if (isDev) {
    window.webContents.openDevTools({ mode: "detach" });
  }

  const url = getRouteURL("onboarding");
  window.loadURL(url);

  window.on("closed", () => {
    handleAppEvent({ type: "onboarding_xout" });
  });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
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
      app.exit();
      return {
        type: "closing",
      };
    case "onboarding_complete":
      state.window.removeAllListeners();
      state.window.close();
      return startRunning({
        type: "running",
        path: event.path,
      });
  }
}

function startRunning(state: Omit<AppRunningState, "tray">): AppRunningState {
  console.log("Start");
  const tray = new Tray(path.join(__static, "tray.png"));
  const menu = Menu.buildFromTemplate([{ role: "quit" }]);
  tray.setToolTip("RaLo");
  tray.setContextMenu(menu);
  return { ...state, tray };
}

app.whenReady().then(() => {
  handleAppEvent({ type: "init" });
});

// Don't stop when the windows close
app.on("window-all-closed", (e: Event) => e.preventDefault());
