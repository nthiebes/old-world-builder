import React from "react";

import { Button } from "../button";

import "./NumberInput.css";

export const NumberInput = (props) => {
  const handleOnUpClick = (event) => {
    event.preventDefault();

    props.onChange({
      target: {
        value: Number(props.value) + 1,
      },
    });
  };
  const handleOnDownClick = (event) => {
    event.preventDefault();

    props.onChange({
      target: {
        value: Number(props.value) - 1,
      },
    });
  };

  return (
    <div className="number-input">
      <input {...props} type="number" />
      <Button
        onClick={handleOnUpClick}
        type="secondary"
        icon="up"
        label="Erhöhen"
        disabled={props.value >= props.max}
        className="number-input__button number-input__button--up"
      />
      <Button
        onClick={handleOnDownClick}
        type="secondary"
        icon="down"
        label="Verringern"
        disabled={props.value <= props.min}
        className="number-input__button number-input__button--down"
      />
    </div>
  );
};
