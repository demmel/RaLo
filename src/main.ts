import { app, BrowserWindow } from "electron";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 500,
    height: 600,
    // frame: false,
    resizable: false,
    webPreferences: { nodeIntegration: true },
  });
  win.loadFile("OnboardingFlow.html");
});
