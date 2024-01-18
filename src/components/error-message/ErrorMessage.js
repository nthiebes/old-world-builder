import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Icon } from "../icon";

import "./ErrorMessage.css";

export const ErrorMessage = ({ children }) => {
  return (
    <p className="error-message">
      <Icon symbol="error" color="red" className="error-message__icon" />
      {children || <FormattedMessage id="misc.minError" />}
    </p>
  );
};

ErrorMessage.propTypes = {
  children: PropTypes.node,
};
