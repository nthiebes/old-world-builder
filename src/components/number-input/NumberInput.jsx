import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "../button";
import { ErrorMessage } from "../error-message";

import "./NumberInput.css";

export const NumberInput = ({
  onChange,
  value,
  id,
  max,
  min,
  readOnly,
  required,
  noError,
  interval,
}) => {
  const intl = useIntl();
  const handleOnUpClick = (event) => {
    event.preventDefault();

    onChange({
      target: {
        value: Number(value) + (interval ? interval : 1),
        id,
      },
    });
  };
  const handleOnDownClick = (event) => {
    event.preventDefault();

    onChange({
      target: {
        value: Number(value) - (interval ? interval : 1),
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

    onChange({
      target: {
        value: newValue,
        id,
      },
    });
  };

  return (
    <>
      <div className="number-input">
        <input
          type="number"
          pattern="[0-9]*"
          min={0}
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
          disabled={(value >= max && max !== 0) || (max === 0 && min === 0)}
          className="number-input__button number-input__button--up"
        />
        <Button
          onClick={handleOnDownClick}
          type="secondary"
          icon="down"
          label={intl.formatMessage({ id: "misc.decrease" })}
          disabled={value <= min || (max === 0 && min === 0)}
          className="number-input__button number-input__button--down"
        />
      </div>
      {value < min && !noError && (
        <ErrorMessage spaceAfter>
          <FormattedMessage
            id="misc.minError"
            values={{
              min,
            }}
          />
        </ErrorMessage>
      )}
    </>
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
  noError: PropTypes.bool,
};

NumberInput.defaultProps = {
  min: 0,
  max: 100000,
};
