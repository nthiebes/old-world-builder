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
  spaceTop,
  fullWidth,
  label,
  icon,
  centered,
  color,
  submitButton,
  disabled,
}) => {
  const Component = to ? Link : "button";
  const buttonProps = {};

  if (!to) {
    if (submitButton) {
      buttonProps.type = "submit";
    } else {
      buttonProps.type = "button";
    }
  }

  return (
    <Component
      className={classNames(
        "button",
        `button--${type}`,
        color && `button--${color}`,
        spaceBottom && "button--spaceBottom",
        spaceTop && "button--spaceTop",
        fullWidth && "button--fullWidth",
        centered && "button--centered",
        disabled && "button--disabled",
        className
      )}
      onClick={onClick}
      to={to}
      aria-label={label}
      title={label}
      disabled={disabled}
      {...buttonProps}
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
  spaceTop: PropTypes.bool,
  fullWidth: PropTypes.bool,
  centered: PropTypes.bool,
  icon: PropTypes.string,
  color: PropTypes.string,
  submitButton: PropTypes.bool,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  type: "primary",
};
