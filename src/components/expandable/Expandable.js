import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export const Expandable = ({
  className,
  headline,
  children,
  darkMode,
  notBold,
  open,
  onClick,
}) => (
  <details className={classNames("expandable", className)} open={open}>
    <summary
      className={classNames(
        "expandable__summary",
        darkMode && "expandable__summary--dark-mode",
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
  darkMode: PropTypes.bool,
  open: PropTypes.bool,
  onClick: PropTypes.func,
  notBold: PropTypes.bool,
};

Expandable.defaultProps = {
  open: false,
  notBold: false,
};
