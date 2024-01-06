import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { useLanguage } from "../../utils/useLanguage";

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
  spaceTop,
  spaceBottom,
}) => {
  const { language } = useLanguage();
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
        spaceTop && "select--spaceTop",
        spaceBottom && "select--spaceBottom",
        className
      )}
    >
      {options.map(({ name_de, name_en, id: optionValue }) => (
        <option key={optionValue} value={optionValue}>
          {language === "de" ? name_de : name_en}
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
