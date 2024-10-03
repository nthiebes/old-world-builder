import { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { normalizeRuleName } from "../../utils/string";
import { useLanguage } from "../../utils/useLanguage";
import { openRulesIndex } from "../../state/rules-index";

import { sixthrulesMap, rulesMap, synonyms } from "./rules-map";

export const RulesLinksText = ({ textObject, showPageNumbers }) => {
  const { listId } = useParams();
  const list = useSelector((state) => state.lists.find(({ id }) => listId === id));
  
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
    let ruleData = rulesMap[synonym || normalizedName];
    if ( list.game == "warhammer-fantasy-6" ) {
      ruleData = sixthrulesMap[normalizedName] || sixthrulesMap[synonym];
    } else if ( list.game == "warhammer-fantasy-8" ) {
      // TBD
    }

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
