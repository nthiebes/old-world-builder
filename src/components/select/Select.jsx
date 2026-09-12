import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { useLanguage } from "../../utils/useLanguage";

import "./Select.css";

export const Select = ({
  options,
  optionGroups,
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

  let innerElements;
  if (optionGroups) {
    innerElements = optionGroups.map(({ id: groupId, ...group }) => (
      <optgroup label={group[`name_${language}`] || group.name_en} key={groupId}>
        {options.filter((option) => option.group === groupId).map(({ id: optionValue, ...option }) => (
          <option key={optionValue} value={optionValue}>
            {option[`name_${language}`] || option.name_en}
          </option>
        ))}
      </optgroup>
    ));
    innerElements = innerElements.concat(
      options.filter((option) => !option.group || optionGroups.findIndex((group) => group.id === option.group) < 0)
        .map(({ id: optionValue, ...option }) => (
          <option key={optionValue} value={optionValue}>
            {option[`name_${language}`] || option.name_en}
          </option>
        ))
    );
  } else {
    innerElements = options.map(({ id: optionValue, ...option }) => (
      <option key={optionValue} value={optionValue}>
        {option[`name_${language}`] || option.name_en}
      </option>
    ));
  }

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
      {innerElements}
    </select>
  );
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
  optionGroups: PropTypes.array,
  className: PropTypes.string,
  onChange: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  selected: PropTypes.string,
  disabled: PropTypes.bool,
  spaceTop: PropTypes.bool,
  spaceBottom: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
