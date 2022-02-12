import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import classNames from "classnames";

import { Icon } from "..//icon";

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
  icon,
  centered,
}) => {
  const Component = to ? Link : "button";

  return (
    <Component
      className={classNames(
        "button",
        `button--${type}`,
        spaceBottom && "button--spaceBottom",
        fullWidth && "button--fullWidth",
        centered && "button--centered",
        className
      )}
      onClick={onClick}
      to={to}
      aria-label={label}
      title={label}
    >
      {icon && (
        <Icon
          className={classNames(children && "button__icon")}
          symbol={icon}
        />
      )}
      {children && children}
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
  centered: PropTypes.bool,
  icon: PropTypes.string,
};

Button.defaultProps = {
  type: "primary",
};
