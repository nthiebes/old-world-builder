import { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useIntl } from "react-intl";

import { Button } from "../button";
import { useLanguage } from "../../utils/useLanguage";
import { openRulesIndex } from "../../state/rules-index";

import { getRuleData } from "./rules-map";

export const RulesWithIcon = ({ textObject }) => {
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const intl = useIntl();
  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id),
  );
  const listArmyComposition = list?.armyComposition || list?.army;

  if (!textObject.name_en) {
    return [];
  }

  const textEn = textObject.name_en.split(/, | \+ |\[/);
  const ruleString = textObject[`name_${language}`] || textObject.name_en;
  const ruleButtons = ruleString.split(/, | \+ |\[/);

  return ruleButtons.map((rule, index) => {
    return (
      <Fragment key={`${rule}-${index}`}>
        {getRuleData(textEn[index], listArmyComposition) ? (
          <span className="unit__rule-wrapper">
            {rule
              .replace(/\[/g, "")
              .replace(/\]/g, "")
              .replace(/ *\{[^)]*\}/g, "")}
            <Button
              type="text"
              className="unit__rules"
              color="dark"
              label={intl.formatMessage({ id: "misc.showRules" })}
              icon="preview"
              onClick={() =>
                dispatch(openRulesIndex({ activeRule: textEn[index] }))
              }
            />
            {index !== ruleButtons.length - 1 && ", "}
          </span>
        ) : (
          <>
            {rule
              .replace(/\[/g, "")
              .replace(/\]/g, "")
              .replace(/ *\{[^)]*\}/g, "")}
            {index !== ruleButtons.length - 1 && ", "}
          </>
        )}
      </Fragment>
    );
  });
};
