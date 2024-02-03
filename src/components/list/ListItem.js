import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import classNames from "classnames";

import "./List.css";

export const ListItem = forwardRef(
  ({ to, onClick, children, className, active, ...attributes }, ref) => {
    const Component = to ? Link : "button";

    return (
      <li
        {...attributes}
        ref={ref}
        className={classNames("list", active && "list--active", className)}
      >
        <Component to={to} className="list__inner" onClick={onClick}>
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
};
