import * as React from "react";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import WelcomeScreen from "./WelcomeScreen";
import StorageSelectScreen from "./StorageSelectScreen";

const useStyles = createUseStyles({
  root: { height: "100%" },
});

type Step = "welcome" | "storage-picker";

function OnboardingFlow() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <OnboardingFlowInner />
    </div>
  );
}

function OnboardingFlowInner() {
  const [step, setStep] = useState<Step>("welcome");
  switch (step) {
    case "welcome":
      return <WelcomeScreen onNextClicked={() => setStep("storage-picker")} />;
    case "storage-picker":
      return <StorageSelectScreen onNextClicked={() => {}} />;
  }
}

export default OnboardingFlow;
