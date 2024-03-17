import { nameMap } from "../pages/magic";
import { rulesMap, synonyms } from "../components/rules-index";
import { normalizeRuleName } from "./string";

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
  { removeFactionName = true, noMagic, language: overrideLanguage } = {}
) => {
  const language = overrideLanguage || localStorage.getItem("lang");
  const detachmentActive =
    options?.length > 0 &&
    Boolean(
      options.find((option) => option.name_en === "Detachment" && option.active)
    );
  const allCommand = [];
  const allMounts = [];

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
  const allOptions = options
    ? options
        .filter(({ active }) => active)
        .map(({ name_en, ...item }) => item[`name_${language}`] || name_en)
    : [];
  const allStackableOptions = options
    ? options
        .filter(({ stackableCount }) => stackableCount > 0)
        .map(
          ({ name_en, stackableCount, ...item }) =>
            `${stackableCount} ${item[`name_${language}`] || name_en}`
        )
    : [];

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

          return `${strength} ${item[`name_${language}`] || name_en}${
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

  const allOptionsArray = [
    ...allEquipment,
    ...allArmor,
    ...allOptions,
    ...allStackableOptions,
    ...allCommand,
    ...allMounts,
    ...(!noMagic ? allItems : []),
    ...allDetachments,
    ...lore,
  ];
  let allOptionsString = allOptionsArray.join(", ").replace(/\*/g, "");

  if (removeFactionName) {
    allOptionsString = allOptionsString.replace(/ *\{[^)]*\}/g, "");
  }

  if (allOptionsString) {
    return allOptionsString;
  }
  return null;
};

export const getStats = (unit) => {
  const normalizedName = normalizeRuleName(unit.name_en);
  const synonym = synonyms[normalizedName];
  const stats = rulesMap[synonym || normalizedName]?.stats || [];
  const activeMount = unit.mounts.find((mount) => mount.active);
  const normalizedMountName = normalizeRuleName(activeMount?.name_en || "");
  const mountSynonym = synonyms[normalizedMountName];
  const mountStats = rulesMap[mountSynonym || normalizedMountName]?.stats || [];

  return [...stats, ...mountStats];
};

export const getUnitName = ({ unit, language }) => {
  return (unit.name || unit[`name_${language}`] || unit.name_en).replace(
    / *\{[^)]*\}/g,
    ""
  );
};
