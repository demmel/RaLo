import "../reset.css";
import * as React from "react";
import { useState } from "react";
import * as ReactDOM from "react-dom";
import { createUseStyles } from "react-jss";
import WelcomeScreen from "./WelcomeScreen.tsx";
import StorageSelectScreen from "./StorageSelectScreen.tsx";

const useStyles = createUseStyles({
  root: { height: "100%" },
});

type Step = "welcome" | "storage-picker";

function OnboardingFlow() {
  const styles = useStyles();
  const [step, setStep] = useState<Step>("welcome");

  return (
    <div className={styles.root}>
      {(function () {
        switch (step) {
          case "welcome":
            return (
              <WelcomeScreen onNextClicked={() => setStep("storage-picker")} />
            );
          case "storage-picker":
            return <StorageSelectScreen onNextClicked={() => {}} />;
        }
      })()}
    </div>
  );
}

ReactDOM.render(<OnboardingFlow />, document.getElementById("app"));
