import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./Icon.css";

export const Icon = ({ className, symbol, color }) => {
  return (
    <svg
      focusable="false"
      className={classNames("icon", color && `icon--${color}`, className)}
    >
      <use xlinkHref={`/symbol-defs.svg#icon-${symbol}`} />
    </svg>
  );
};

Icon.propTypes = {
  className: PropTypes.string,
  symbol: PropTypes.string.isRequired,
};
