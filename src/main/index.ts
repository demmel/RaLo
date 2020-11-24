if (module.hot) {
  module.hot.accept();
}

import { app, BrowserWindow } from "electron";
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

type AppClosingState = { type: "closing" };

type AppState = AppInitState | AppOnboardingState | AppClosingState;

type AppEvent =
  | {
      type: "init";
    }
  | {
      type: "onboarding_xout";
    };

let appState: AppState = {
  type: "init",
};

function handleAppEvent(event: AppEvent) {
  appState = (function () {
    switch (appState.type) {
      case "init":
        return reduceInitState(appState, event);
      case "onboarding":
        return reduceOnboardingState(appState, event);
      case "closing":
        return reduceClosingState(appState, event);
    }
  })();
}

function reduceInitState(state: AppInitState, event: AppEvent): AppState {
  if (event.type != "init") {
    throw new Error("'init' is the only valid app event on app init");
  }

  const window = new BrowserWindow({
    webPreferences: { enableRemoteModule: true, nodeIntegration: true },
    width: 500,
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

  return {
    type: "onboarding",
    window,
  };
}

function reduceOnboardingState(
  state: AppOnboardingState,
  event: AppEvent
): AppState {
  switch (event.type) {
    case "onboarding_xout":
      app.exit();
      return {
        type: "closing",
      };
    default:
      throw new Error(`Invalid event during onboarding: ${event.type}`);
  }
}

function reduceClosingState(state: AppClosingState, event: AppEvent): AppState {
  throw new Error("Should not receive events during close");
}

app.whenReady().then(() => {
  handleAppEvent({ type: "init" });
});
