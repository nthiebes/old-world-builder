import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Dialog } from "../../components/dialog";
import { Spinner } from "../../components/spinner";
import { removeParens } from "../../utils/string";
import { closeRulesIndex } from "../../state/rules-index";

import { rulesMap } from "./rules-map";
import "./RulesIndex.css";
import { FormattedMessage } from "react-intl";

export const RulesIndex = () => {
  const { open, activeRule } = useSelector((state) => state.rulesIndex);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const handleClose = () => {
    setIsLoading(true);
    dispatch(closeRulesIndex());
  };
  const rulePath = rulesMap[removeParens(activeRule)];

  return (
    <Dialog open={open} onClose={handleClose}>
      {rulesMap[removeParens(activeRule)] ? (
        <>
          <iframe
            onLoad={() => setIsLoading(false)}
            className="rules-index__iframe"
            src={`https://tow.whfb.app/${rulePath}?minimal=true`}
            title="test"
            height="500"
            width="500"
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
