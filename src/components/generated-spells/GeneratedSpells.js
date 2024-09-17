import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import PropTypes from "prop-types";

import { Button } from "../button";
import { LocalizedRuleLink } from "../rules-index";

import "./GeneratedSpells.css";

function spellIdToFormattedMessageId(spellId) {
  const formattedSpellId = spellId
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’()!]/g, "")
    .replace(/ /g, "-");

  return `magic.spell.${formattedSpellId}`;
}

export const GeneratedSpells = ({
  availableLoresWithSpells,
  maxGeneratedSpellCount,
  showPageNumbers,
}) => {
  const intl = useIntl();
  const [generatedSpells, setGeneratedSpells] = useState(
    Object.keys(availableLoresWithSpells).reduce(
      (initialState, loreId) => ({ ...initialState, [loreId]: [] }),
      {}
    )
  );
  const [showGenerationList, setShowGenerationList] = useState(false);

  const handleSpellSelectionChange = (loreId, spellId, selected) => {
    if (selected) {
      setGeneratedSpells((generatedSpells) => {
        // Insert the newly selected spell at the correct index (signature spell first)
        if (availableLoresWithSpells[loreId][spellId].index === "signature") {
          return {
            ...generatedSpells,
            [loreId]: [spellId, ...generatedSpells[loreId]],
          };
        }
        for (let i = 0; i <= generatedSpells[loreId].length; i++) {
          const generatedSpellIndex =
            availableLoresWithSpells[loreId][generatedSpells[loreId][i]]?.index;
          if (
            i === generatedSpells[loreId].length ||
            (generatedSpellIndex !== "signature" &&
              generatedSpellIndex >
                availableLoresWithSpells[loreId][spellId].index)
          ) {
            return {
              ...generatedSpells,
              [loreId]: generatedSpells[loreId].toSpliced(i, 0, spellId),
            };
          }
        }
      });
    } else {
      setGeneratedSpells((generatedSpells) => ({
        ...generatedSpells,
        [loreId]: generatedSpells[loreId].filter((id) => id !== spellId),
      }));
    }
  };

  let generatedSpellCount = 0;
  let signatureSpellIsGenerated = false;

  for (const loreId in generatedSpells) {
    generatedSpellCount += generatedSpells[loreId].length;
    if (
      availableLoresWithSpells[loreId][generatedSpells[loreId][0]]?.index ===
      "signature"
    ) {
      signatureSpellIsGenerated = true;
    }
  }

  return (
    <div className="generated-spells__wrapper">
      <p className="generated-spells__header">
        <FormattedMessage id="misc.generatedSpells" />
        {` (${generatedSpellCount}/${maxGeneratedSpellCount}) `}
        <Button
          type="text"
          color="dark"
          className="generated-spells__edit-button"
          label={intl.formatMessage({ id: "misc.editGeneratedSpells" })}
          onClick={() =>
            setShowGenerationList((showGenerationList) => !showGenerationList)
          }
          icon={showGenerationList ? "edit-off" : "edit"}
        />
      </p>
      {showGenerationList ? (
        <ul className="generated-spells__spells-selection-list">
          {Object.entries(availableLoresWithSpells).map(([loreId, spells]) => (
            <li key={loreId}>
              <ul>
                <div className="generated-spells__list-header">
                  <FormattedMessage id={`magic.lore.${loreId}`} />
                </div>
                {Object.entries(spells).map(([spellId, spell]) => {
                  const spellIsGenerated =
                    generatedSpells[loreId].find((id) => id === spellId) !==
                    undefined;

                  return (
                    <li key={spellId}>
                      <label className="generated-spells__spell-label">
                        <input
                          type="checkbox"
                          checked={spellIsGenerated}
                          disabled={
                            (generatedSpellCount === maxGeneratedSpellCount &&
                              !spellIsGenerated) ||
                            (spell.index === "signature" &&
                              signatureSpellIsGenerated &&
                              !spellIsGenerated)
                          }
                          onChange={(event) => {
                            handleSpellSelectionChange(
                              loreId,
                              spellId,
                              event.target.checked
                            );
                          }}
                        />
                        <span className="generated-spells__spell-index">
                          {spell.index === "signature"
                            ? intl.formatMessage({
                                id: "misc.signatureAbbr",
                              })
                            : spell.index}
                        </span>
                        <FormattedMessage
                          id={spellIdToFormattedMessageId(spellId)}
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        Object.values(generatedSpells).map((spells) =>
          spells.map((spellId) => (
            <span className="generated-spells__spell-rule" key={spellId}>
              <LocalizedRuleLink
                ruleName={spellId}
                formattedMessageId={spellIdToFormattedMessageId(spellId)}
                showPageNumber={showPageNumbers}
              />
            </span>
          ))
        )
      )}
    </div>
  );
};

GeneratedSpells.propTypes = {
  availableLoresWithSpells: PropTypes.objectOf(PropTypes.object).isRequired,
  maxGeneratedSpellCount: PropTypes.number.isRequired,
  showPageNumbers: PropTypes.bool,
};
