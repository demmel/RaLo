import * as React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    boxSizing: "border-box",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    padding: 32,
  },
  title: { fontSize: 36 },
  text: { fontSize: 24, textAlign: "center", marginTop: 32, lineHeight: 1.1 },
  button: { fontSize: 24, marginTop: 32 },
});

type Props = {
  onNextClicked: () => void;
};

function WelcomeScreen({ onNextClicked }: Props) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Welcome to Ralo!</h1>
      <p className={styles.text}>
        Ralo stands for Rapid Logging. It's a lightweight way to take notes
        without having to pull out a notebook or fumble through your apps
        looking for the text editor. You simply use a shortcut to pull up the
        app, take a note, and get back to what you were doing. It's pretty
        simple.
      </p>
      <p className={styles.text}>
        Looks like this is your first time starting Ralo. Let's take a minute to
        set things up. You'll only need to do this once.
      </p>
      <button onClick={onNextClicked} className={styles.button}>
        Next
      </button>
    </div>
  );
}

export default WelcomeScreen;
