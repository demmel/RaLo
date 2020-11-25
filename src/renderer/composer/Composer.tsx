import * as React from "react";
import {
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
  KeyboardEvent,
  useEffect,
} from "react";
import { createUseStyles } from "react-jss";
import { LogType } from "common/types";
import LogIcon from "./LogIcon";
import { ipcRenderer, remote } from "electron";
import closeWindow from "common/closeWindow";

const CONTAINER_PADDING = 16;
const INPUT_PADDING = 8;
const TEXT_AREA_LINE_HEIGHT = 24;

window.addEventListener("keyup", (e) => {
  if (e.key !== "Escape") {
    return;
  }
  const currentWindow = remote.getCurrentWindow();
  closeWindow(currentWindow);
  e.stopPropagation();
});

const useStyles = createUseStyles({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    padding: CONTAINER_PADDING,
    boxSizing: "border-box",
  },
  icon: {
    boxSizing: "border-box",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: "#333333 ",
    border: "2px solid #282828",
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 7,
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
  inputContainer: {
    padding: INPUT_PADDING,
    backgroundColor: "#282828",
    boxShadow: "inset 0 0 5px #191919",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    backgroundColor: "#282828",
    color: "#FFFFFF",
    border: "none",
    fontSize: 24,
    lineHeight: 1,
    outline: "none",
    resize: "none",
  },
});

function Composer() {
  const styles = useStyles();
  const ref = useRef(null);
  const [shouldResize, setShouldResize] = useState(true);
  const [rows, setRows] = useState(1);
  const [type, setType] = useState<LogType>("task");
  const [text, setText] = useState("");

  useEffect(
    function () {
      if (!shouldResize) {
        return;
      }
      ipcRenderer.send("resize", {
        height:
          2 * CONTAINER_PADDING +
          2 * INPUT_PADDING +
          TEXT_AREA_LINE_HEIGHT * rows,
      });
      setShouldResize(false);
    },
    [shouldResize]
  );

  const onChange = useCallback(
    function (event: SyntheticEvent<HTMLTextAreaElement>) {
      const newRows = ~~(
        event.currentTarget.scrollHeight / TEXT_AREA_LINE_HEIGHT
      );
      if (newRows !== rows) {
        setRows(newRows);
        setShouldResize(true);
      }

      const input = event.currentTarget.value;
      switch (input) {
        case "t ":
          setType("task");
          setText("");
          return;
        case "e ":
          setType("event");
          setText("");
          return;
        case "n ":
          setType("note");
          setText("");
          return;
        default:
          setText(input);
      }
    },
    [rows]
  );

  const onSubmit = useCallback(
    function (e) {
      e.preventDefault();

      if (text === "") {
        return;
      }

      // const dateString = date.format("YYYY-MM-DD");
      // const day = store.days[dateString];

      ipcRenderer.send("create_log", { text });
    },
    [text, type]
  );

  const onKeyDown = useCallback(
    function (event: KeyboardEvent<HTMLTextAreaElement>) {
      if (event.key === "Enter") {
        event.preventDefault();
        onSubmit(event);
      }
    },
    [onSubmit]
  );

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <LogIcon type={type} color="#FFFFFF" size={16} />
      </div>
      <div className={styles.inputContainer}>
        <textarea
          ref={ref}
          rows={rows}
          autoFocus={true}
          className={styles.input}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}

export default Composer;
