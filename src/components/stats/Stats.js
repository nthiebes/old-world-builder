import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import "./Stats.css";

export const Stats = ({ values, isPrintPage }) => {
  return (
    <table className={classNames("stats", isPrintPage && "stats--print-page")}>
      <thead>
        <tr>
          <th>
            <FormattedMessage id="unit.model" />
          </th>
          <th>
            <FormattedMessage id="unit.m" />
          </th>
          <th>
            <FormattedMessage id="unit.ws" />
          </th>
          <th>
            <FormattedMessage id="unit.bs" />
          </th>
          <th>
            <FormattedMessage id="unit.s" />
          </th>
          <th>
            <FormattedMessage id="unit.t" />
          </th>
          <th>
            <FormattedMessage id="unit.w" />
          </th>
          <th>
            <FormattedMessage id="unit.i" />
          </th>
          <th>
            <FormattedMessage id="unit.a" />
          </th>
          <th>
            <FormattedMessage id="unit.ld" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{values.name}</td>
          <td>{values.M}</td>
          <td>{values.WS}</td>
          <td>{values.BS}</td>
          <td>{values.S}</td>
          <td>{values.T}</td>
          <td>{values.W}</td>
          <td>{values.I}</td>
          <td>{values.A}</td>
          <td>{values.LD}</td>
        </tr>
      </tbody>
    </table>
  );
};

Stats.propTypes = {
  values: PropTypes.object,
};
