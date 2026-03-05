import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";

import { normalizeRuleName } from "../../utils/string";
import { openRulesIndex } from "../../state/rules-index";
import { rulesMap, synonyms } from "./rules-map";

export const LocalizedRuleLink = ({
  ruleName,
  formattedMessageId,
  formattedMessageValues,
  showPageNumber,
}) => {
  const dispatch = useDispatch();
  const normalizedRuleName = normalizeRuleName(ruleName);
  const synonym = synonyms[normalizedRuleName];
  const ruleData = rulesMap[synonym || normalizedRuleName];

  return ruleData ? (
    <>
      <button
        className="unit__rule"
        onClick={() =>
          dispatch(openRulesIndex({ activeRule: normalizedRuleName }))
        }
      >
        <FormattedMessage
          id={formattedMessageId}
          values={formattedMessageValues}
        />
      </button>
      {showPageNumber && ` [${ruleData.page}]`}
    </>
  ) : (
    <FormattedMessage id={formattedMessageId} values={formattedMessageValues} />
  );
};
