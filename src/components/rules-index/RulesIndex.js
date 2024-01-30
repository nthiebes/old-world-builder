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

  return (
    <Dialog open={open} onClose={() => dispatch(closeRulesIndex())}>
      {rulesMap[activeRule] ? (
        <>
          <iframe
            onLoad={() => setIsLoading(false)}
            className="rules-index__iframe"
            src={`https://tow.whfb.app/${rulesMap[activeRule]}`}
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
