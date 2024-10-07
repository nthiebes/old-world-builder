import { nameMap } from "../pages/magic";
import { sixthRulesMap, rulesMap, synonyms } from "../components/rules-index";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
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

  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  if (pageNumbers) {
    allOptionsArray = allOptionsArray.map((option) => {
      const page = getPage(option, list.game);

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

export const getPage = (name, game) => {
  const normalizedName = normalizeRuleName(name);
  const synonym = synonyms[normalizedName];
  let page = rulesMap[synonym || normalizedName]?.page || "";
  if ( game == "warhammer-fantasy-6" ) {
    page = sixthRulesMap[synonym || normalizedName]?.page || "";
  } else if ( game == "warhammer-fantasy-8" ) {
    // TBD
  }

  return page.replace(/,/g, "");
};

export const getStats = (unit, game) => {
  const normalizedName = normalizeRuleName(unit.name_en);
  const synonym = synonyms[normalizedName];
  const activeMount = unit.mounts.find((mount) => mount.active);
  const normalizedMountName = normalizeRuleName(activeMount?.name_en || "");
  const mountSynonym = synonyms[normalizedMountName];
  let stats = rulesMap[synonym || normalizedName]?.stats || [];
  let mountStats = rulesMap[mountSynonym || normalizedMountName]?.stats || [];
  let detachStats = rulesMap[detachmentSynonym || normalizedDetachment]?.stats || []
  if ( game == "warhammer-fantasy-6" ) {
    stats = sixthRulesMap[synonym || normalizedName]?.stats || [];
    mountStats = sixthRulesMap[mountSynonym || normalizedMountName]?.stats || [];
    detatchmentStats = sixthRulesMap[detachmentSynonym || normalizedDetachment]?.stats || []
  } else if ( game == "warhammer-fantasy-8" ) {
    // TBD
  }
  const detachments = unit.detachments || [];
  const detachmentStats = [];

  detachments.forEach((detachment) => {
    const normalizedDetachment = normalizeRuleName(detachment?.name_en || "");
    const detachmentSynonym = synonyms[normalizedDetachment];

    detachmentStats.push(
      ...(detachStats)
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
