import { Fragment } from "react";
import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";

import { Button } from "../button";
import { normalizeRuleName } from "../../utils/string";
import { useLanguage } from "../../utils/useLanguage";
import { openRulesIndex } from "../../state/rules-index";

import { rulesMap, synonyms } from "./rules-map";

export const RulesWithIcon = ({ textObject }) => {
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const intl = useIntl();

  if (!textObject.name_en) {
    return [];
  }

  const textEn = textObject.name_en.split(/, | \+ | \[/);
  const ruleString = textObject[`name_${language}`] || textObject.name_en;
  let ruleButtons = ruleString.split(/, | \+ | \[/);

  return ruleButtons.map((rule, index) => {
    return (
      <Fragment key={rule}>
        {rulesMap[normalizeRuleName(textEn[index])] ||
        rulesMap[synonyms[normalizeRuleName(textEn[index])]] ? (
          <span className="unit__rule-wrapper">
            {rule.replace(/\[/g, "").replace(/\]/g, "")}
            <Button
              type="text"
              className="unit__rules"
              color="dark"
              label={intl.formatMessage({ id: "misc.showRules" })}
              icon="preview"
              onClick={() => dispatch(openRulesIndex({ activeRule: rule }))}
            />
            {index !== ruleButtons.length - 1 && ", "}
          </span>
        ) : (
          <>
            {rule}
            {index !== ruleButtons.length - 1 && ", "}
          </>
        )}
      </Fragment>
    );
  });
};
