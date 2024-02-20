import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";

import { Button } from "../button";
import { normalizeRuleName } from "../../utils/string";
import { openRulesIndex } from "../../state/rules-index";

import { rulesMap, synonyms } from "./rules-map";
import "./RuleWithIcon.css";

export const RuleWithIcon = ({ name, isDark }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  if (!name) {
    return null;
  }

  const normalizedName = normalizeRuleName(name);
  const synonym = synonyms[normalizedName];

  return rulesMap[normalizedName] || rulesMap[synonym] ? (
    <Button
      type="text"
      className="rule-icon"
      color={isDark ? "dark" : "light"}
      label={intl.formatMessage({ id: "misc.showRules" })}
      icon="preview"
      onClick={() => dispatch(openRulesIndex({ activeRule: name }))}
    />
  ) : null;
};
