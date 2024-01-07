import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import "./Expandable.css";

export const Expandable = ({
  className,
  headline,
  children,
  notBold,
  open,
  onClick,
  noMargin,
}) => (
  <details
    className={classNames(
      "expandable",
      noMargin && "expandable--no-margin",
      className
    )}
    open={open}
  >
    <summary
      className={classNames(
        "expandable__summary",
        notBold && "expandable__summary--normal"
      )}
      onClick={onClick}
    >
      {headline}
    </summary>
    {children}
  </details>
);

Expandable.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  headline: PropTypes.node.isRequired,
  open: PropTypes.bool,
  onClick: PropTypes.func,
  notBold: PropTypes.bool,
};

Expandable.defaultProps = {
  open: false,
  notBold: false,
};
