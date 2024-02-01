import React from "react";
import classNames from "classnames";

import { Icon } from "../icon";

import "./Spinner.css";

export const Spinner = ({ className }) => {
  return <Icon symbol="spinner" className={classNames("spinner", className)} />;
};
