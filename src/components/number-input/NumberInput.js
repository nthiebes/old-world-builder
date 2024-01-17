import React from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";

import { Button } from "../button";

import "./NumberInput.css";

export const NumberInput = ({
  onChange,
  value,
  id,
  max,
  min,
  readOnly,
  required,
}) => {
  const intl = useIntl();
  const handleOnUpClick = (event) => {
    event.preventDefault();

    onChange({
      target: {
        value: Number(value) + 1,
        id,
      },
    });
  };
  const handleOnDownClick = (event) => {
    event.preventDefault();

    onChange({
      target: {
        value: Number(value) - 1,
        id,
      },
    });
  };
  const handleOnChange = (event) => {
    let newValue = Number(event.target.value);
    const maxValue = max > 0 ? max : 100000;

    if (newValue > maxValue) {
      newValue = maxValue;
    }
    if (newValue < min) {
      newValue = min;
    }

    onChange({
      target: {
        value: newValue,
        id,
      },
    });
  };

  return (
    <div className="number-input">
      <input
        type="number"
        pattern="[0-9]*"
        min={min}
        max={max > 0 ? max : 100000}
        value={value}
        onChange={handleOnChange}
        id={id}
        readOnly={readOnly}
        required={required}
        className="input"
      />
      <Button
        onClick={handleOnUpClick}
        type="secondary"
        icon="up"
        label={intl.formatMessage({ id: "misc.increase" })}
        disabled={value >= max && max !== 0}
        className="number-input__button number-input__button--up"
      />
      <Button
        onClick={handleOnDownClick}
        type="secondary"
        icon="down"
        label={intl.formatMessage({ id: "misc.decrease" })}
        disabled={value <= min}
        className="number-input__button number-input__button--down"
      />
    </div>
  );
};

NumberInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.number,
  id: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
};

NumberInput.defaultProps = {
  min: 0,
  max: 100000,
};
