import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import PropTypes from "prop-types";

import { Button } from "../button";
import { RulesLinksText } from "../rules-index";
import { useLanguage } from "../../utils/useLanguage";

import "./GeneratedSpells.css";

export const GeneratedSpells = ({
  loresWithSpells,
  spellsCount,
  showPageNumbers,
}) => {
  const intl = useIntl();
  const { language } = useLanguage();
  const [generatedSpells, setGeneratedSpells] = useState([]);
  const [showGenerationList, setShowGenerationList] = useState(false);

  const handleSpellSelectionChange = (spell, selected) => {
    if (selected) {
      setGeneratedSpells((generatedSpells) => {
        // Insert the newly selected spell at the correct index (signature spell first)
        if (spell.index === "signature") {
          return [spell, ...generatedSpells];
        }
        for (let i = 0; i <= generatedSpells.length; i++) {
          if (
            i === generatedSpells.length ||
            (generatedSpells[i].index !== "signature" &&
              generatedSpells[i].index > spell.index)
          ) {
            return generatedSpells.toSpliced(i, 0, spell);
          }
        }
      });
    } else {
      setGeneratedSpells((generatedSpells) =>
        generatedSpells.filter(({ name_en }) => name_en !== spell.name_en)
      );
    }
  };

  return (
    <div className="generated-spells__wrapper">
      <span className="generated-spells__header">
        <FormattedMessage id="misc.generatedSpells" />
        {` (${generatedSpells.length}/${spellsCount}) `}
        <Button
          type="text"
          color="dark"
          className="generated-spells__edit-button"
          label={intl.formatMessage({ id: "misc.editGeneratedSpells" })}
          onClick={() =>
            setShowGenerationList((showGenerationList) => !showGenerationList)
          }
          icon="edit"
        />
      </span>
      {showGenerationList ? (
        <ul className="generated-spells__spells-selection-list">
          {loresWithSpells.map((lore) => {
            return (
              <li key={lore.name_en}>
                <ul>
                  <div className="generated-spells__list-header">
                    {lore[`name_${language}`]}
                  </div>
                  {Object.keys(lore.spells)
                    .map((key) => lore.spells[key])
                    .map((spell) => {
                      return (
                        <li key={spell.name_en}>
                          <label className="generated-spells__spell-label">
                            <input
                              type="checkbox"
                              checked={
                                generatedSpells.find(
                                  ({ name_en }) => name_en === spell.name_en
                                ) !== undefined
                              }
                              disabled={
                                (generatedSpells.length === spellsCount &&
                                  generatedSpells.find(
                                    ({ name_en }) => name_en === spell.name_en
                                  ) === undefined) ||
                                (spell.index === "signature" &&
                                  generatedSpells[0]?.index === "signature" &&
                                  generatedSpells[0].name_en !== spell.name_en)
                              }
                              onChange={(event) => {
                                handleSpellSelectionChange(
                                  spell,
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
                            {spell[`name_${language}`]}
                          </label>
                        </li>
                      );
                    })}
                </ul>
              </li>
            );
          })}
        </ul>
      ) : (
        generatedSpells.map((spell) => (
          <span className="generated-spells__spell-rule" key={spell.name_en}>
            <RulesLinksText
              textObject={spell}
              showPageNumbers={showPageNumbers}
            />
          </span>
        ))
      )}
    </div>
  );
};

GeneratedSpells.propTypes = {
  loresWithSpells: PropTypes.arrayOf(PropTypes.object),
  spellsCount: PropTypes.number,
  showPageNumbers: PropTypes.bool,
};
