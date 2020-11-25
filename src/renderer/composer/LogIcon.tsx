import React from "react";
import { FaCircle, FaRegCircle, FaMinus } from "react-icons/fa";
import { LogType } from "common/types";

type Props = {
  type: LogType;
  color?: string;
  size?: number;
};

const LOG_ICONS = Object.freeze({
  task: FaCircle,
  event: FaRegCircle,
  note: FaMinus,
});

function LogIcon({ type, ...iconProps }: Props) {
  const Icon = LOG_ICONS[type];
  return <Icon {...iconProps} />;
}

export default LogIcon;
