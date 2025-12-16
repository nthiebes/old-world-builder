import classNames from "classnames";

import { nameMap } from "../pages/magic";
import { rulesMap, synonyms } from "../components/rules-index";
import loresOfMagicWithSpells from "../assets/lores-of-magic-with-spells.json";
import { normalizeRuleName } from "./string";

export const getUnitRuleData = (unitName) => {
  const normalizedRuleName = normalizeRuleName(unitName);
  const synonym = synonyms[normalizedRuleName];
  return rulesMap[synonym || normalizedRuleName];
};

export const getUnitLeadership = (unitName) => {
  const ruleData = getUnitRuleData(unitName);

  if (!ruleData) {
    return false;
  }

  return ruleData.stats?.length
    ? ruleData.stats.reduce(
        (previousValue, statLine) =>
          (parseInt(statLine.Ld) || 0) > previousValue
            ? parseInt(statLine.Ld)
            : previousValue,
        0
      )
    : 0;
};

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
    lores: unitLores,
    armyComposition: unitArmyComposition,
  },
  {
    removeFactionName = true,
    noMagic,
    language: overrideLanguage,
    pageNumbers,
    armyComposition,
  } = {}
) => {
  const language = overrideLanguage || localStorage.getItem("lang");
  const detachmentActive =
    options?.length > 0 &&
    Boolean(
      options.find((option) => option.name_en === "Detachment" && option.active)
    );
  const lores = unitArmyComposition?.[armyComposition]?.lores || unitLores;
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
        .filter(
          ({ active, equippedDefault, requiredMagicItem }) =>
            (active && !requiredMagicItem) ||
            (equippedDefault && !requiredMagicItem) ||
            (active &&
              requiredMagicItem &&
              unitHasItem({ items }, requiredMagicItem))
        )
        .map(({ name_en, ...item }) => item[`name_${language}`] || name_en)
    : [];
  const allArmor = armor
    ? armor
        .filter(
          ({ active, requiredMagicItem }) =>
            (active && !requiredMagicItem) ||
            (active &&
              requiredMagicItem &&
              unitHasItem({ items }, requiredMagicItem))
        )
        .map(({ name_en, ...item }) => item[`name_${language}`] || name_en)
    : [];

  if (options) {
    options.forEach(
      ({
        active,
        alwaysActive,
        armyComposition: unitArmyComposition,
        name_en,
        options: subOptions,
        stackableCount,
        requiredMagicItem,
        ...entry
      }) => {
        if (
          (alwaysActive && unitArmyComposition === armyComposition) ||
          (active && !requiredMagicItem) ||
          (active &&
            requiredMagicItem &&
            unitHasItem({ items }, requiredMagicItem))
        ) {
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
    mounts
      .filter(
        ({ active, equippedDefault, requiredMagicItem }) =>
          (active && !requiredMagicItem) ||
          (equippedDefault && !requiredMagicItem) ||
          (active &&
            requiredMagicItem &&
            unitHasItem({ items }, requiredMagicItem))
      )
      .forEach(({ active, name_en, options, ...entry }) => {
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
              if (option.stackable && option.stackableCount > 0) {
                equipmentSelection.push(
                  `${option.stackableCount}x ${option[`name_${language}`]}` ||
                    option.name_en
                );
              } else {
                (option.active || option.equippedDefault) &&
                  equipmentSelection.push(
                    `${option[`name_${language}`]}` || option.name_en
                  );
              }
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
  if (isWizard({ options, command, mounts })) {
    if (activeLore && nameMap[activeLore].name_en !== "None") {
      lore.push(
        nameMap[activeLore][`name_${language}`] || nameMap[activeLore].name_en
      );
    } else if (lores?.length && nameMap[lores[0]].name_en !== "None") {
      lore.push(
        nameMap[lores[0]][`name_${language}`] || nameMap[lores[0]].name_en
      );
    }
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
  const page = getUnitRuleData(name)?.page || "";

  return page.replace(/,/g, "");
};

export const getStats = (unit, armyComposition) => {
  const normalizedName =
    unit.name_en.includes("renegade") && armyComposition?.includes("renegade")
      ? normalizeRuleName(unit.name_en)
      : normalizeRuleName(unit.name_en.replace(" {renegade}", ""));
  const synonym = synonyms[normalizedName];
  const stats = rulesMap[synonym || normalizedName]?.stats || [];
  const activeMount = unit.mounts
    ? unit.mounts.find((mount) => mount.active)
    : null;
  const mountStats = getUnitRuleData(activeMount?.name_en || "")?.stats || [];
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

export const getUnitOptionNotes = ({
  notes,
  key,
  className,
  language,
  disabled,
}) => {
  return (Array.isArray(notes) ? [...notes] : notes ? [notes] : []).map(
    (note, index) => (
      <p
        className={classNames(
          className,
          disabled && "unit__option-note--disabled"
        )}
        key={`${key}-${index}`}
      >
        {note[`name_${language}`] || note.name_en}
      </p>
    )
  );
};

/**
 * Recursive lookup of a unit option satisfying the test function argument.
 * By default, when onlyFollowActiveOptions is true, the function will only
 * look deeper in sub options if the parent option is active.
 * Return the first matching option or undefined.
 */
export const findOption = (
  options,
  testFunc,
  onlyFollowActiveOptions = true
) => {
  if (Array.isArray(options)) {
    for (const option of options) {
      const foundOption = findOption(option, testFunc, onlyFollowActiveOptions);
      if (foundOption) {
        return foundOption;
      }
    }
  } else if (testFunc(options)) {
    return options;
  } else if ((!onlyFollowActiveOptions || options.active) && options.options) {
    return findOption(options.options, testFunc, onlyFollowActiveOptions);
  }
  return undefined;
};

/**
 * Recursive lookup of all unit options satisfying the test function argument.
 * By default, when onlyFollowActiveOptions is true, the function will only
 * look deeper in sub options if the parent option is active.
 * Return an array of options (empty if nothing found).
 */
export const findAllOptions = (
  options,
  testFunc,
  onlyFollowActiveOptions = true
) => {
  const foundOptions = [];

  if (Array.isArray(options)) {
    for (const option of options) {
      foundOptions.push(
        ...findAllOptions(option, testFunc, onlyFollowActiveOptions)
      );
    }
  } else if (options) {
    if (testFunc(options)) {
      foundOptions.push(options);
    }
    if ((!onlyFollowActiveOptions || options.active) && options.options) {
      foundOptions.push(
        ...findAllOptions(options.options, testFunc, onlyFollowActiveOptions)
      );
    }
  }
  return foundOptions;
};

/**
 * Returns true if a unit is equipped with given itemName (not case sensitive),
 * false otherwise.
 */
export const unitHasItem = (unit, itemName) => {
  if (unit.items) {
    for (const itemCategory of unit.items) {
      if (
        itemCategory.selected &&
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

export const isWizard = (unitToCheck) => {
  const unit = {
    ...unitToCheck,
    options: unitToCheck.options || [],
  };
  return (
    optionsHaveActiveWizard(unit) ||
    hasActiveWizardOption(unitToCheck.command) ||
    hasActiveWizardOption(unitToCheck.mounts)
  );
};

export const optionsHaveActiveWizard = (optionHolder) => {
  return Boolean(
    findOption(
      optionHolder.options,
      ({ name_en, active }) =>
        active && name_en.toLowerCase().includes("wizard")
    )
  );
};

export const hasActiveWizardOption = (optionHoldersList) => {
  const allOptionsForActiveHolders = {
    ...optionHoldersList,
    options:
      optionHoldersList && optionHoldersList.length
        ? optionHoldersList
            .filter((optionHolder) => optionHolder.active)
            .filter((activeOptionHolder) => activeOptionHolder.options)
            .flatMap(
              (activeOptionHolderWithOptions) =>
                activeOptionHolderWithOptions.options
            )
        : [],
  };
  return optionsHaveActiveWizard(allOptionsForActiveHolders);
};

/**
 * Returns the lores of magic and their spells the unit can use based on its
 * special rules and its selected lore.
 */
export const getUnitLoresWithSpells = (unit, armyComposition) => {
  const specialRuleLores = (unit?.specialRules?.name_en || "")
    .split(", ")
    .filter((rule) => /^Lore of/.test(rule))
    .reduce((result, rule) => {
      const loreId = rule.toLowerCase().replace(/ /g, "-");

      // If the unit has the Lore of Chaos, only the spell matching its Mark of Chaos must be available
      if (loreId === "lore-of-chaos") {
        const markOfChaosOption = findOption(
          unit.options,
          ({ active, name_en }) =>
            active &&
            /^Mark of (Chaos Undivided|Nurgle|Khorne|Slaanesh|Tzeentch)/.test(
              name_en
            )
        );
        const markOfChaos = markOfChaosOption
          ? markOfChaosOption.name_en.slice(8).toLowerCase().replace(/ /g, "-")
          : "chaos-undivided";

        // No spell if Mark of Khorne
        if (markOfChaos === "khorne") {
          return result;
        }

        const loreOfChaosSpell = Object.entries(
          loresOfMagicWithSpells[loreId]
        ).find(
          ([spellId, spellData]) => spellData["mark-of-chaos"] === markOfChaos
        );
        return {
          ...result,
          [loreId]: {
            [loreOfChaosSpell[0]]: loreOfChaosSpell[1],
          },
        };
      }

      return {
        ...result,
        [loreId]: loresOfMagicWithSpells[loreId],
      };
    }, {});

  if (unit.id.includes("miao-ying")) {
    specialRuleLores["miao-ying"] = loresOfMagicWithSpells["miao-ying"];
  }

  // Lores added via unit option
  let optionsLore = findOption(
    unit.options,
    ({ active, name_en }) => active && /Lore of Yang|Lore of Yin/.test(name_en)
  );

  if (optionsLore) {
    const loreId = optionsLore.name_en.toLowerCase().replace(/ /g, "-");

    specialRuleLores[loreId] = loresOfMagicWithSpells[loreId];
  }

  const unitLores = unit.armyComposition
    ? unit.armyComposition[armyComposition]?.lores
      ? unit.armyComposition[armyComposition].lores
      : unit.lores || []
    : unit.lores || [];

  const selectedLores =
    unitHasItem(unit, "Wizarding Hat") || unitHasItem(unit, "Arcane Familiar")
      ? {
          "battle-magic": loresOfMagicWithSpells["battle-magic"],
          daemonology: loresOfMagicWithSpells["daemonology"],
          "dark-magic": loresOfMagicWithSpells["dark-magic"],
          elementalism: loresOfMagicWithSpells["elementalism"],
          "high-magic": loresOfMagicWithSpells["high-magic"],
          illusion: loresOfMagicWithSpells["illusion"],
          necromancy: loresOfMagicWithSpells["necromancy"],
          "waaagh-magic": loresOfMagicWithSpells["waaagh-magic"],
          shadowlands: loresOfMagicWithSpells["shadowlands"],
        }
      : unitHasItem(unit, "Loremaster")
      ? {
          "lore-of-saphery": loresOfMagicWithSpells["lore-of-saphery"],
          "battle-magic": loresOfMagicWithSpells["battle-magic"],
          elementalism: loresOfMagicWithSpells["elementalism"],
          "high-magic": loresOfMagicWithSpells["high-magic"],
          illusion: loresOfMagicWithSpells["illusion"],
        }
      : findOption(
          unit.options || [],
          ({ active, name_en }) =>
            active && /^Arise!, Level 1 Wizard/.test(name_en)
        )
      ? { necromancy: loresOfMagicWithSpells["necromancy"] }
      : unitLores.length > 0
      ? {
          [unit.activeLore ?? unitLores[0]]:
            loresOfMagicWithSpells[unit.activeLore ?? unitLores[0]],
        }
      : {};

  if (unit.arcaneFamiliar) {
    unitLores.forEach((lore) => {
      selectedLores[lore] = loresOfMagicWithSpells[lore];
    });
  }

  return { ...specialRuleLores, ...selectedLores };
};

/**
 * Search for "Level x Wizard" in the unit options and deduct the unit level of
 * wizardry.
 */
export const getUnitWizardryLevel = (unit) => {
  if (unitHasItem(unit, "Loremaster")) {
    return 1;
  }

  const levelOptions = findAllOptions(unit?.options, (option) =>
    /^(Arise!, )?Level [1234] Wizard/.test(option?.name_en)
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
export const getUnitGeneratedSpellCount = (unit) => {
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
    unitHasItem(unit, "Tome Of Furion") ||
    unitHasItem(unit, "Tome Of Midnight")
  ) {
    generatedSpellsCount += 1;
  }

  return generatedSpellsCount;
};
