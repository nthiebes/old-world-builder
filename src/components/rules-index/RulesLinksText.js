import { Fragment } from "react";
import { useDispatch } from "react-redux";

import { normalizeRuleName } from "../../utils/string";
import { useLanguage } from "../../utils/useLanguage";
import { openRulesIndex } from "../../state/rules-index";

import { rulesMap } from "./rules-map";

export const RulesLinksText = ({ textObject }) => {
  const dispatch = useDispatch();
  const { language } = useLanguage();

  if (!textObject.name_en) {
    return [];
  }

  const textEn = textObject.name_en.split(", ");
  const ruleString = textObject[`name_${language}`] || textObject.name_en;
  let ruleButtons = ruleString.split(", ");

  return ruleButtons.map((rule, index) => (
    <Fragment key={rule}>
      {rulesMap[normalizeRuleName(textEn[index])] ? (
        <button
          className="unit__rule"
          onClick={() =>
            dispatch(openRulesIndex({ activeRule: textEn[index] }))
          }
        >
          {rule}
          {index !== ruleButtons.length - 1 && ", "}
        </button>
      ) : (
        <>
          {rule}
          {index !== ruleButtons.length - 1 && ", "}
        </>
      )}
    </Fragment>
  ));
};
