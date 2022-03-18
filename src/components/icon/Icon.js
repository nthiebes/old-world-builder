import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import icons from "../../assets/symbol-defs.svg";

import "./Icon.css";

export const Icon = ({ className, symbol, color }) => {
  return (
    <svg
      focusable="false"
      className={classNames("icon", color && `icon--${color}`, className)}
    >
      <use xlinkHref={`${icons}#icon-${symbol}`} />
    </svg>
  );
};

Icon.propTypes = {
  className: PropTypes.string,
  symbol: PropTypes.string.isRequired,
};
