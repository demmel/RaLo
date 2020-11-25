import { remote } from "electron";
import * as React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  title: { fontSize: 36 },
  text: { fontSize: 24, textAlign: "center", marginTop: 32, lineHeight: 1.1 },
  selector: {
    fontSize: 24,
    boxSizing: "border-box",
    height: "100%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#000000",
    color: "#FFFFFF",
    backgroundColor: "#1E1E1E",
  },
  selectorButton: {
    fontSize: 24,
  },
  selectorRow: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
});

type Props = {
  path: string | null;
  onPathSelected: (path: string | null) => void;
};

function StorageSelectScreen({ path, onPathSelected }: Props) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Select Data Storage</h1>
      <p className={styles.text}>
        RaLo doesn't store data on a server to protect your privacy. Instead, it
        will store it locally on your device. Please select the folder where
        you'd like RaLo to store your logs.
      </p>
      <p className={styles.text}>
        Tip: If you want your data sync'd to the cloud, then pick a cloud-sync'd
        folder such as Dropbox, OneDrive, iCloud, etc
      </p>
      <div className={styles.selectorRow}>
        <button
          className={styles.selectorButton}
          onClick={() =>
            remote.dialog
              .showOpenDialog(remote.getCurrentWindow(), {
                properties: ["openDirectory"],
              })
              .then(({ filePaths }) => {
                const newPath = filePaths[0];
                if (newPath == null) {
                  return;
                }
                onPathSelected(newPath);
              })
          }
        >
          Select Folder
        </button>
        <input
          className={styles.selector}
          value={path || ""}
          onChange={(event) => {
            onPathSelected(event.target.value);
          }}
        />
      </div>
    </div>
  );
}

export default StorageSelectScreen;
