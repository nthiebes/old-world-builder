import { useSelector, useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Button } from "../button";
import { normalizeRuleName } from "../../utils/string";
import { openRulesIndex } from "../../state/rules-index";

import { rulesMap, sixthrulesMap, synonyms } from "./rules-map";
import "./RuleWithIcon.css";

export const RuleWithIcon = ({ name, isDark, className }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  if (!name) {
    return null;
  }

  const { listId } = useParams();
  const list = useSelector((state) => state.lists.find(({ id }) => listId === id));
  console.log(`--- gameMode ${list.game}`)
  
  let selectedRulesMap = rulesMap;
  if ( list.game == "warhammer-fantasy-6" ) {
    selectedRulesMap = sixthrulesMap;
  } else if ( list.game == "warhammer-fantasy-8" ) {
    // TBD
  }

  const normalizedName = normalizeRuleName(name);
  const synonym = synonyms[normalizedName];

  console.log(`--- normalizedName ${normalizedName}`)
  console.log(`--- synonym ${synonym}`)

  return selectedRulesMap[normalizedName] || selectedRulesMap[synonym] ? (
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
  isDark: PropTypes.bool,
};
