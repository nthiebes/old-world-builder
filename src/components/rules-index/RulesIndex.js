import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Dialog } from "../../components/dialog";
import { Spinner } from "../../components/spinner";
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

  console.log(isLoading);

  return (
    <Dialog open={open} onClose={handleClose}>
      {rulesMap[activeRule] ? (
        <>
          <iframe
            onLoad={() => setIsLoading(false)}
            className="rules-index__iframe"
            src={`https://tow.whfb.app/${rulesMap[activeRule]}?minimal=true`}
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
