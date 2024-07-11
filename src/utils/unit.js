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
  if (activeLore) {
    lore.push(
      nameMap[activeLore][`name_${language}`] || nameMap[activeLore].name_en
    );
  } else if (lores?.length) {
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
      return loresOfMagicWithSpells[loreId];
    });

  const selectedLores = unit.lores
    ? [loresOfMagicWithSpells[unit.activeLore ?? unit.lores[0]]]
    : [];

  return [...specialRuleLores, ...selectedLores];
};

/**
 * Search for "Level x Wizard" in the unit options and deduct the unit level of
 * wizardry.
 */
export const getUnitWizardryLevel = (unit) => {
  const levelOptions = unit.options.filter(({ name_en }) =>
    /^Level [1234] Wizard/.test(name_en)
  );

  let wizardryLevel = 4;

  for (let i = 0; i < levelOptions.length; i++) {
    const levelOptionValue = Number(levelOptions[i].name_en.match(/[1234]/)[0]);

    if (levelOptions[i].active) {
      return levelOptionValue;
    }
    if (levelOptionValue <= wizardryLevel) {
      wizardryLevel = levelOptionValue - 1;
    }
  }

  return wizardryLevel === 4 ? 0 : wizardryLevel;
};
