import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import classNames from "classnames";

import "./Button.css";

export const Button = ({
  className,
  type,
  to,
  onClick,
  children,
  spaceBottom,
  fullWidth,
  label,
}) => {
  const Component = to ? Link : "button";

  return (
    <Component
      className={classNames(
        "button",
        `button--${type}`,
        spaceBottom && "button--spaceBottom",
        fullWidth && "button--fullWidth",
        className
      )}
      onClick={onClick}
      to={to}
      aria-label={label}
    >
      {children}
    </Component>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  to: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  spaceBottom: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

Button.defaultProps = {
  type: "secondary",
};
