if (module.hot) {
  module.hot.accept();
}

import "@/reset.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { remote } from "electron";
import { getRouteFromURL } from "common/router";
import OnboardingFlow from "@/onboarding/OnboardingFlow";
import Composer from "@/composer/Composer";

const url = remote.getCurrentWindow().webContents.getURL();
const route = getRouteFromURL(url);

function App() {
  switch (route) {
    case "onboarding":
      return <OnboardingFlow />;
    case "composer":
      return <Composer />;
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
