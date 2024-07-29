import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import classNames from "classnames";

import { Icon } from "../icon";

import "./ErrorMessage.css";

export const ErrorMessage = ({ children, spaceAfter, spaceBefore }) => {
  return (
    <p
      className={classNames(
        "error-message",
        spaceBefore && "error-message--space-before",
        spaceAfter && "error-message--space-after"
      )}
    >
      <Icon symbol="error" color="red" className="error-message__icon" />
      {children || <FormattedMessage id="misc.minError" />}
    </p>
  );
};

ErrorMessage.propTypes = {
  children: PropTypes.node,
  spaceBefore: PropTypes.bool,
  spaceAfter: PropTypes.bool,
};
