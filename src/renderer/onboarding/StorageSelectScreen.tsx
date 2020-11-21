import * as React from "react";
import { useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    boxSizing: "border-box",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
  },
  button: { fontSize: 24, marginTop: 32 },
});

type Props = {
  onNextClicked: () => void;
};

function StorageSelectScreen({ onNextClicked }: Props) {
  const styles = useStyles();
  const path = useState(null);

  return (
    <div className={styles.root}>
      <button
        disabled={path == null}
        onClick={onNextClicked}
        className={styles.button}
      >
        Next
      </button>
    </div>
  );
}

export default StorageSelectScreen;
