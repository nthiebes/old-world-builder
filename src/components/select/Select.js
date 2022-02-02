// import React, { Component, Fragment } from 'react';
import PropTypes from "prop-types";
import classNames from "classnames";

import "./Select.css";

export const Select = ({
  options,
  className,
  id,
  name,
  required,
  selected,
  disabled,
  value,
  onChange,
  spaceBottom,
}) => {
  const handleOnChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <select
      id={id}
      name={name}
      required={required}
      onChange={handleOnChange}
      value={value}
      defaultValue={selected}
      disabled={disabled}
      className={classNames(
        "select",
        spaceBottom && "select--spaceBottom",
        className
      )}
    >
      {options.map(({ name, id: optionValue }) => (
        <option key={optionValue} value={optionValue}>
          {name}
        </option>
      ))}
    </select>
  );
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  selected: PropTypes.string,
  disabled: PropTypes.bool,
  spaceBottom: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
