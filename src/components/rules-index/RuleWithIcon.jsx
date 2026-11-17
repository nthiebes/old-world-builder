import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Button } from "../button";
import { openRulesIndex } from "../../state/rules-index";

import { getRuleData } from "./rules-map";
import "./RuleWithIcon.css";

export const RuleWithIcon = ({ name, armyComposition, isDark, className }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  if (!name) {
    return null;
  }

  const ruleExists = getRuleData(name, armyComposition);

  return ruleExists ? (
    <Button
      type="text"
      className={classNames("rule-icon", className && className)}
      color={isDark ? "dark" : "light"}
      label={intl.formatMessage({ id: "misc.showRules" })}
      icon="preview"
      onClick={() => dispatch(openRulesIndex({ activeRule: name }))}
    />
  ) : null;
};

RuleWithIcon.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  armyComposition: PropTypes.string,
  isDark: PropTypes.bool,
};
