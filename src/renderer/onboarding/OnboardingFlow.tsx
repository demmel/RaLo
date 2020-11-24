import * as React from "react";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import WelcomeScreen from "./WelcomeScreen";
import StorageSelectScreen from "./StorageSelectScreen";
import fs from "fs";
import { ipcRenderer } from "electron";

const useStyles = createUseStyles({
  root: {
    height: "100%",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
  },
  buttons: {
    marginTop: 32,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    "& :first-child": {
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  button: {
    fontSize: 24,
  },
  spacer: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
  },
});

type Step = "welcome" | "storage-picker";
type Path = { valid: boolean; value: string | null };

function OnboardingFlow() {
  const styles = useStyles();
  const [step, setStep] = useState<Step>("welcome");
  const [path, setPath] = useState<Path>({
    valid: false,
    value: null,
  });

  const content = (function () {
    switch (step) {
      case "welcome":
        return <WelcomeScreen />;
      case "storage-picker":
        return (
          <StorageSelectScreen
            path={path.value}
            onPathSelected={(path) => {
              if (path == null) {
                setPath({ valid: false, value: null });
              } else {
                fs.promises.stat(path).then((stats) => {
                  setPath({ valid: stats.isDirectory(), value: path });
                });
              }
            }}
          />
        );
    }
  })();

  return (
    <div className={styles.root}>
      <div className={styles.content}>{content}</div>
      <div className={styles.buttons}>
        {step != "welcome" && (
          <button
            className={styles.button}
            onClick={function () {
              const next = (function (): Step {
                switch (step) {
                  case "storage-picker":
                    return "welcome";
                }
              })();
              setStep(next);
            }}
          >
            Back
          </button>
        )}
        {step != "storage-picker" && (
          <button
            className={styles.button}
            disabled={(function () {
              switch (step) {
                case "welcome":
                  return false;
              }
            })()}
            onClick={function () {
              const next = (function (): Step {
                switch (step) {
                  case "welcome":
                    return "storage-picker";
                }
              })();
              setStep(next);
            }}
          >
            Next
          </button>
        )}
        {step == "storage-picker" && (
          <button
            className={styles.button}
            disabled={(function () {
              switch (step) {
                case "storage-picker":
                  return !path.valid;
              }
            })()}
            onClick={function () {
              ipcRenderer.send("onboarding-complete", {
                path: path.value,
              });
            }}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;
