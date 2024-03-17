import { Fragment } from "react";
import { useDispatch } from "react-redux";

import { normalizeRuleName } from "../../utils/string";
import { useLanguage } from "../../utils/useLanguage";
import { openRulesIndex } from "../../state/rules-index";

import { rulesMap, synonyms } from "./rules-map";

export const RulesLinksText = ({ textObject, showPageNumbers }) => {
  const dispatch = useDispatch();
  const { language } = useLanguage();

  if (!textObject.name_en) {
    return [];
  }

  const textEn = textObject.name_en.split(", ");
  const ruleString = textObject[`name_${language}`] || textObject.name_en;
  let ruleButtons = ruleString.split(", ");

  return ruleButtons.map((rule, index) => {
    const normalizedName = normalizeRuleName(textEn[index]);
    const synonym = synonyms[normalizedName];
    const ruleData = rulesMap[synonym || normalizedName];

    return (
      <Fragment key={rule}>
        {ruleData ? (
          <>
            <button
              className="unit__rule"
              onClick={() =>
                dispatch(openRulesIndex({ activeRule: textEn[index] }))
              }
            >
              {rule.replace(/ *\{[^)]*\}/g, "")}
            </button>
            {showPageNumbers && ` [${ruleData.page}]`}
            {index !== ruleButtons.length - 1 && ", "}
          </>
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
