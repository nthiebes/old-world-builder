import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import classNames from "classnames";

import "./List.css";

export const ListItem = forwardRef(
  (
    { to, onClick, children, className, active, disabled, hide, ...attributes },
    ref
  ) => {
    const Component = to ? Link : "button";

    return (
      <li
        {...attributes}
        ref={ref}
        className={classNames(
          "list",
          active && "list--active",
          hide && "list--hidden",
          className
        )}
      >
        <Component
          to={to}
          className={classNames(
            "list__inner",
            disabled && "list__inner--disabled"
          )}
          onClick={onClick}
        >
          {children}
        </Component>
      </li>
    );
  }
);

ListItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  to: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  hide: PropTypes.bool,
};
