if (module.hot) {
  module.hot.accept();
}

import "@/reset.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { remote } from "electron";
import { getRouteFromURL } from "common/router";
import OnboardingFlow from "@/onboarding/OnboardingFlow";

const url = remote.getCurrentWindow().webContents.getURL();
const route = getRouteFromURL(url);

function App() {
  switch (route) {
    case "onboarding":
      return <OnboardingFlow />;
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
