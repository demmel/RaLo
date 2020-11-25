import { Tray, BrowserWindow } from "electron";

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

export function getState(): Readonly<AppState> {
  return appState;
}

export function setState(state: AppState) {
  appState = state;
}

export function assertState<T extends AppState["type"]>(
  expected: T
): Readonly<Extract<AppState, { type: T }>> {
  if (appState.type != expected) {
    throw new Error(
      `Expected state type '${expected}', but state type is currently '${appState.type}'`
    );
  }
  return appState as Extract<AppState, { type: T }>;
}
