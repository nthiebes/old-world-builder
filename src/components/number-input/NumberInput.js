import React from "react";
import { useIntl } from "react-intl";

import { Button } from "../button";

import "./NumberInput.css";

export const NumberInput = (props) => {
  const intl = useIntl();
  const handleOnUpClick = (event) => {
    event.preventDefault();

    props.onChange({
      target: {
        value: Number(props.value) + 1,
        id: props.id,
      },
    });
  };
  const handleOnDownClick = (event) => {
    event.preventDefault();

    props.onChange({
      target: {
        value: Number(props.value) - 1,
        id: props.id,
      },
    });
  };

  return (
    <div className="number-input">
      <input {...props} type="number" pattern="[0-9]*" />
      <Button
        onClick={handleOnUpClick}
        type="secondary"
        icon="up"
        label={intl.formatMessage({ id: "misc.increase" })}
        disabled={props.value >= props.max}
        className="number-input__button number-input__button--up"
      />
      <Button
        onClick={handleOnDownClick}
        type="secondary"
        icon="down"
        label={intl.formatMessage({ id: "misc.decrease" })}
        disabled={props.value <= props.min}
        className="number-input__button number-input__button--down"
      />
    </div>
  );
};
