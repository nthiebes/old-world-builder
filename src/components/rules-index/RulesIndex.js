import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";

import { Dialog } from "../../components/dialog";
import { Spinner } from "../../components/spinner";
import { normalizeRuleName } from "../../utils/string";
import { closeRulesIndex } from "../../state/rules-index";

import { rulesMap, synonyms } from "./rules-map";
import "./RulesIndex.css";

export const RulesIndex = () => {
  const { open, activeRule } = useSelector((state) => state.rulesIndex);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const handleClose = () => {
    setIsLoading(true);
    dispatch(closeRulesIndex());
  };
  const normalizedName = normalizeRuleName(activeRule);
  const synonym = synonyms[normalizedName];
  const ruleData = rulesMap[normalizedName] || rulesMap[synonym];
  const rulePath = ruleData?.url;

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
            src={`https://tow.whfb.app/${rulePath}?minimal=true&utm_source=owb&utm_medium=referral`}
            title="Warhammer: The Old World Online Rules Index"
            height="500"
            width="600"
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
