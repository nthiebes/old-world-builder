import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import "./Stats.css";

export const Stats = ({ values, isPrintPage, className }) => {
  return (
    <div className={classNames("stats-wrapper", className && className)}>
      <table
        className={classNames("stats", isPrintPage && "stats--print-page")}
      >
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
          {values.map((stats, index) => (
            <tr key={`${stats.name}${index}`}>
              <td>{stats.Name}</td>
              <td>{stats.M}</td>
              <td>{stats.WS}</td>
              <td>{stats.BS}</td>
              <td>{stats.S}</td>
              <td>{stats.T}</td>
              <td>{stats.W}</td>
              <td>{stats.I}</td>
              <td>{stats.A}</td>
              <td>{stats.Ld}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Stats.propTypes = {
  values: PropTypes.array,
  isPrintPage: PropTypes.bool,
  className: PropTypes.string,
};
