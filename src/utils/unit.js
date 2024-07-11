import { nameMap } from "../pages/magic";
import { rulesMap, synonyms } from "../components/rules-index";
import { normalizeRuleName } from "./string";
import loresOfMagicWithSpells from "./lores-of-magic-with-spells.json";

export const getAllOptions = (
  {
    mounts,
    equipment,
    armor,
    options,
    command,
    items,
    detachments,
    activeLore,
    lores,
  },
  {
    removeFactionName = true,
    noMagic,
    language: overrideLanguage,
    pageNumbers,
  } = {}
) => {
  const language = overrideLanguage || localStorage.getItem("lang");
  const detachmentActive =
    options?.length > 0 &&
    Boolean(
      options.find((option) => option.name_en === "Detachment" && option.active)
    );
  const allCommand = [];
  const allMounts = [];
  const allOptions = [];

  if (command && !detachmentActive) {
    command.forEach(({ active, magic, name_en, options, ...entry }) => {
      if (active) {
        let commandEntry = entry[`name_${language}`] || name_en;
        const selectedOptions = [];

        if (options && options.length > 0) {
          options.forEach((option) => {
            if (option.active) {
              selectedOptions.push(option.name_en);
            }
          });
        }

        if (magic && magic?.selected?.length && !noMagic) {
          magic.selected.forEach((selectedItem) => {
            selectedOptions.push(
              selectedItem.amount > 1
                ? `${selectedItem.amount}x ` +
                    selectedItem[`name_${language}`] || selectedItem.name_en
                : selectedItem[`name_${language}`] || selectedItem.name_en
            );
          });
        }

        if (selectedOptions.length) {
          commandEntry += ` [${selectedOptions.join(" + ")}]`;
        }

        allCommand.push(commandEntry);
      }
    });
  }
  const allEquipment = equipment
    ? equipment
        .filter(({ active, equippedDefault }) => active || equippedDefault)
        .map(({ name_en, ...item }) => item[`name_${language}`] || name_en)
    : [];
  const allArmor = armor
    ? armor
        .filter(({ active }) => active)
        .map(({ name_en, ...item }) => item[`name_${language}`] || name_en)
    : [];

  if (options) {
    options.forEach(
      ({ active, name_en, options: subOptions, stackableCount, ...entry }) => {
        if (active) {
          let optionEntry = entry[`name_${language}`] || name_en;
          const selectedOptions = [];

          if (subOptions && subOptions.length > 0) {
            subOptions.forEach((option) => {
              if (option.active) {
                selectedOptions.push(option.name_en);
              }
            });
          }

          if (selectedOptions.length) {
            optionEntry += ` [${selectedOptions.join(" + ")}]`;
          }

          allOptions.push(optionEntry);
        } else if (stackableCount > 0) {
          allOptions.push(
            `${stackableCount}x ${entry[`name_${language}`] || name_en}`
          );
        }
      }
    );
  }

  if (mounts) {
    mounts.forEach(({ active, name_en, options, ...entry }) => {
      if (active) {
        let mountEntry = entry[`name_${language}`] || name_en;
        const selectedOptions = [];

        if (options && options.length > 0) {
          options.forEach((option) => {
            if (option.active) {
              selectedOptions.push(option.name_en);
            }
          });
        }

        if (selectedOptions.length) {
          mountEntry += ` [${selectedOptions.join(" + ")}]`;
        }

        allMounts.push(mountEntry);
      }
    });
  }

  const allItems = [];
  if (items?.length) {
    items.forEach((item) => {
      (item.selected || []).forEach((selectedItem) => {
        allItems.push(
          selectedItem.amount > 1
            ? `${selectedItem.amount}x ` +
                (selectedItem[`name_${language}`] || selectedItem.name_en)
            : selectedItem[`name_${language}`] || selectedItem.name_en
        );
      });
    });
  }
  const allDetachments = detachments
    ? detachments
        .filter(({ strength }) => strength > 0)
        .map(({ name_en, strength, equipment, armor, options, ...item }) => {
          let equipmentSelection = [];

          if (equipment && equipment.length) {
            equipment.forEach((option) => {
              (option.active || option.equippedDefault) &&
                equipmentSelection.push(
                  `${option[`name_${language}`]}` || option.name_en
                );
            });
          }
          if (armor && armor.length) {
            armor.forEach((option) => {
              option.active &&
                equipmentSelection.push(
                  `${option[`name_${language}`]}` || option.name_en
                );
            });
          }
          if (options && options.length) {
            options.forEach((option) => {
              option.active &&
                equipmentSelection.push(
                  `${option[`name_${language}`]}` || option.name_en
                );
            });
          }

          return `${strength}x ${item[`name_${language}`] || name_en}${
            equipmentSelection.length
              ? ` [${equipmentSelection
                  .map((option) => option.replace(", ", " + "))
                  .join(" + ")}]`
              : ""
          }`;
        })
    : [];
  const lore = [];
  if (activeLore && nameMap[activeLore].name_en !== "None") {
    lore.push(
      nameMap[activeLore][`name_${language}`] || nameMap[activeLore].name_en
    );
  } else if (lores?.length && nameMap[lores[0]].name_en !== "None") {
    lore.push(
      nameMap[lores[0]][`name_${language}`] || nameMap[lores[0]].name_en
    );
  }

  let allOptionsArray = [
    ...allEquipment,
    ...allArmor,
    ...allOptions,
    ...allCommand,
    ...allMounts,
    ...(!noMagic ? allItems : []),
    ...allDetachments,
    ...lore,
  ];

  if (pageNumbers) {
    allOptionsArray = allOptionsArray.map((option) => {
      const page = getPage(option);

      if (page) {
        return `${option} [${page}]`;
      }
      return option;
    });
  }

  let allOptionsString = allOptionsArray.join(", ").replace(/\*/g, "");

  if (removeFactionName) {
    allOptionsString = allOptionsString.replace(/ *\{[^)]*\}/g, "");
  }

  if (allOptionsString) {
    return allOptionsString;
  }
  return null;
};

export const getPage = (name) => {
  const normalizedName = normalizeRuleName(name);
  const synonym = synonyms[normalizedName];
  const page = rulesMap[synonym || normalizedName]?.page || "";

  return page.replace(/,/g, "");
};

export const getStats = (unit) => {
  const normalizedName = normalizeRuleName(unit.name_en);
  const synonym = synonyms[normalizedName];
  const stats = rulesMap[synonym || normalizedName]?.stats || [];
  const activeMount = unit.mounts.find((mount) => mount.active);
  const normalizedMountName = normalizeRuleName(activeMount?.name_en || "");
  const mountSynonym = synonyms[normalizedMountName];
  const mountStats = rulesMap[mountSynonym || normalizedMountName]?.stats || [];
  const detachments = unit.detachments || [];
  const detachmentStats = [];

  detachments.forEach((detachment) => {
    const normalizedDetachment = normalizeRuleName(detachment?.name_en || "");
    const detachmentSynonym = synonyms[normalizedDetachment];

    detachmentStats.push(
      ...(rulesMap[detachmentSynonym || normalizedDetachment]?.stats || [])
    );
  });

  return [...stats, ...mountStats, ...detachmentStats];
};

export const getUnitName = ({ unit, language }) => {
  return (unit.name || unit[`name_${language}`] || unit.name_en).replace(
    / *\{[^)]*\}/g,
    ""
  );
};

export const getUnitOptionNotes = ({ notes, key, className, language }) => {
  return (Array.isArray(notes) ? [...notes] : notes ? [notes] : []).map(
    (note, index) => (
      <p className={className} key={`${key}-${index}`}>
        {note[`name_${language}`] || note.name_en}
      </p>
    )
  );
};

/**
 * Returns true if a unit is equipped with given itemName (not case sensitive),
 * false otherwise.
 */
export const unitHasItem = (unit, itemName) => {
  if (unit.items) {
    for (const itemCategory of unit.items) {
      if (
        itemCategory.selected.find(
          ({ name_en }) => name_en.toLowerCase() === itemName.toLowerCase()
        )
      ) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Returns the lores of magic and their spells the unit can use based on its
 * special rules and its selected lore.
 */
export const getUnitLoresWithSpells = (unit) => {
  const specialRuleLores = unit.specialRules.name_en
    .split(", ")
    .filter((rule) => /^Lore of/.test(rule))
    .map((rule) => {
      const loreId = rule.toLowerCase().replace(/ /g, "-");

      // If the unit has the Lore of Chaos, only the spell matching its Mark
      // of Chaos must be available
      if (loreId === "lore-of-chaos") {
        const markOfChaosOption = unit.options.find(
          ({ active, name_en }) => active && /^Mark of/.test(name_en)
        );
        const markOfChaos = markOfChaosOption
          ? markOfChaosOption.name_en.slice(8).toLowerCase().replace(/ /g, "-")
          : "chaos-undivided";

        // No spell for Mark of Khorne
        if (markOfChaos === "khorne") {
          return null;
        }

        const loreOfChaosSpell = Object.entries(
          loresOfMagicWithSpells[loreId].spells
        ).find(
          ([spellId, spellData]) => spellData["mark-of-chaos"] === markOfChaos
        );
        return {
          ...loresOfMagicWithSpells[loreId],
          spells: {
            [loreOfChaosSpell[0]]: loreOfChaosSpell[1],
          },
        };
      }

      return loresOfMagicWithSpells[loreId];
    })
    .filter((lore) => lore !== null);

  const selectedLores =
    unitHasItem(unit, "Wizarding Hat") || unitHasItem(unit, "Lore Familiar")
      ? [
          loresOfMagicWithSpells["battle-magic"],
          loresOfMagicWithSpells["daemonology"],
          loresOfMagicWithSpells["dark-magic"],
          loresOfMagicWithSpells["elementalism"],
          loresOfMagicWithSpells["high-magic"],
          loresOfMagicWithSpells["illusion"],
          loresOfMagicWithSpells["necromancy"],
          loresOfMagicWithSpells["waaagh-magic"],
        ]
      : unitHasItem(unit, "Loremaster")
      ? [
          loresOfMagicWithSpells["lore-of-saphery"],
          loresOfMagicWithSpells["battle-magic"],
          loresOfMagicWithSpells["elementalism"],
          loresOfMagicWithSpells["high-magic"],
          loresOfMagicWithSpells["illusion"],
        ]
      : unit.options.find(
          ({ name_en, active }) =>
            /^Arise!, Level 1 Wizard/.test(name_en) && active
        )
      ? [loresOfMagicWithSpells["necromancy"]]
      : unit.lores?.length > 0
      ? [loresOfMagicWithSpells[unit.activeLore ?? unit.lores[0]]]
      : [];

  return [...specialRuleLores, ...selectedLores];
};

/**
 * Search for "Level x Wizard" in the unit options and deduct the unit level of
 * wizardry.
 */
export const getUnitWizardryLevel = (unit) => {
  if (unitHasItem(unit, "Loremaster")) {
    return 1;
  }

  const levelOptions = unit.options.filter(({ name_en }) =>
    /^(Arise!, )?Level [1234] Wizard/.test(name_en)
  );

  let wizardryLevel = 4;

  for (let i = 0; i < levelOptions.length; i++) {
    const levelOptionValue = Number(levelOptions[i].name_en.match(/[1234]/)[0]);

    if (levelOptions[i].active) {
      return unitHasItem(unit, "Master Of The Black Arts")
        ? levelOptionValue + 1
        : levelOptionValue;
    }
    if (levelOptionValue <= wizardryLevel) {
      wizardryLevel = levelOptionValue - 1;
    }
  }

  return wizardryLevel === 4 ? 0 : wizardryLevel;
};

/**
 * Return the number of spells a unit can generate based on its level of
 * wizardry, magic items and special rules.
 */
export const getUnitGeneratedSpellsCount = (unit) => {
  let generatedSpellsCount = getUnitWizardryLevel(unit);

  if (unitHasItem(unit, "Wizarding Hat")) {
    generatedSpellsCount += 1;
  }
  if (unitHasItem(unit, "Spell Familiar*")) {
    generatedSpellsCount += 1;
  }
  if (
    unitHasItem(unit, "Twin Heads") ||
    unitHasItem(unit, "Silvery Wand") ||
    unitHasItem(unit, "Tome Of Furion")
  ) {
    generatedSpellsCount += 1;
  }

  return generatedSpellsCount;
};
