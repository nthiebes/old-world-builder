import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";

import { Dialog } from "../../components/dialog";
import { Spinner } from "../../components/spinner";
import { normalizeRuleName } from "../../utils/string";
import { closeRulesIndex } from "../../state/rules-index";

import { rulesMap, synonyms } from "./rules-map";
import "./RulesIndex.css";

const RULES_BASE_URLS = {
  "the-old-world": "https://tow.whfb.app",
  "warhammer-fantasy-6th": "https://6th.whfb.app",
};

export const RulesIndex = () => {
  const { open, activeRule } = useSelector((state) => state.rulesIndex);
  const [isLoading, setIsLoading] = useState(true);
  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const listArmyComposition = list?.armyComposition || list?.army;
  const listGame = list?.game || "warhammer-fantasy-6th";
  const dispatch = useDispatch();
  const handleClose = () => {
    setIsLoading(true);
    dispatch(closeRulesIndex());
  };
  const normalizedName =
    activeRule.includes("renegade") && listArmyComposition?.includes("renegade")
      ? normalizeRuleName(activeRule)
      : normalizeRuleName(activeRule.replace(" {renegade}", ""));
  const synonym = synonyms[normalizedName];
  const ruleData = rulesMap[normalizedName] || rulesMap[synonym];
  const rulePath = ruleData?.url;
  const baseUrl = RULES_BASE_URLS[listGame] || RULES_BASE_URLS["warhammer-fantasy-6th"];

  return (
    <Dialog open={open} onClose={handleClose}>
      {rulePath ? (
        <>
          <iframe
            onLoad={() => setIsLoading(false)}
            className={classNames(
              "rules-index__iframe",
              !isLoading && "rules-index__iframe--show"
            )}
            src={`${baseUrl}/${rulePath}?minimal=true&utm_source=owb&utm_medium=referral`}
            title="Warhammer: The Old World Online Rules Index"
            height="500"
            width="700"
          />
          {isLoading && <Spinner className="rules-index__spinner" />}
        </>
      ) : (
        <p>
          <FormattedMessage id="editor.noRuleFound" />
        </p>
      )}
    </Dialog>
  );
};
