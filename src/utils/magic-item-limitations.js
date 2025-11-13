/**
 * Returns whether the magic item can be taken multiple times.
 *
 * Typically, these are common potions, scrolls or runes
 *
 * @param {object} magicItem
 * @param {string} magicItem.type
 * @param {boolean} [magicItem.stackable]
 * @param {number} [magicItem.maximum]
 * @returns {boolean}
 */
export const isMultipleAllowedItem = ({ stackable, maximum }) =>
  Boolean(stackable || maximum);

/**
 * Calculates the maximum amount of a magic item that can be taken given the remaining points.
 *
 * @param {object} magicItem
 * @param {number} selectedAmount
 * @param {number} unitPointsRemaining
 * @returns
 */
export const maxAllowedOfItem = (
  magicItem,
  selectedAmount,
  unitPointsRemaining
) => {
  if (!magicItem.stackable && !magicItem.maximum) {
    return 1;
  }

  const pointsRemainingMax =
    Math.floor(unitPointsRemaining / magicItem.points) + selectedAmount;

  if (magicItem.maximum) {
    return Math.min(magicItem.maximum, pointsRemainingMax);
  }

  return pointsRemainingMax;
};

/**
 * Checks if items are used elsewhere in an army list, unless an item is extremely common or
 * otherwise can be used by multiple units.
 *
 * @param {object[]} items Array of magic items to be looked for in the list
 * @param {object} list The army list to be checked
 * @param {string} excludeId The id of the character/unit with the items, which will be skipped by the check
 * @returns {object[]} List of error messages for items that have failed validation
 */
export const itemsUsedElsewhere = (items, list, excludeId) => {
  const unitCategories = [
    "characters",
    "core",
    "special",
    "rare",
    "mercenaries",
    "allies",
  ];
  let errors = [];
  for (let i in items) {
    let item = items[i];
    if (item.onePerArmy === true) {
      for (let categoryIndex in unitCategories) {
        let category = unitCategories[categoryIndex];
        for (let j in list[category]) {
          let unit = list[category][j];
          if (unit.id !== excludeId) {
            for (let itemGroup in unit.items) {
              for (let targetItem in unit.items[itemGroup].selected) {
                if (
                  unit.items[itemGroup].selected[targetItem].name_en ===
                  item.name_en
                ) {
                  errors.push({
                    itemName: item.name_en,
                    unit: unit,
                    url: `/editor/${list.id}/${category}/${unit.id}/items/${itemGroup}`,
                  });
                }
              }
            }
            for (let commandGroup in unit.command) {
              if (unit.command[commandGroup].active) {
                for (let targetItem in unit.command[commandGroup].magic
                  ?.selected) {
                  if (
                    unit.command[commandGroup].magic.selected[targetItem]
                      .name_en === item.name_en
                  ) {
                    errors.push({
                      itemName: item.name_en,
                      unit: unit,
                      url: `/editor/${list.id}/${category}/${unit.id}/magic/${commandGroup}`,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return errors;
};

/**
 * Combination Exculsive item categories are categories like runes and incantation scrolls where one or more
 * items can be taken but a particular combination of items must be unique within an army.
 */
export const comboExclusiveCategories = [
  "weapon-runes",
  "armor-runes",
  "talismanic-runes",
  "banner-runes",
  "engineering-runes",
  "ranged-weapon-runes",
  "runic-tattoos",
  "incantation-scroll"
];

/**
 * Checks if an unit's combination of items, grouped by type or category, is shared by other units.
 * Corresponds to the Rule of Pride, FoF pg 32.
 * We treat an item's rune loadout as synonymous with an item category, like Weapon, Armour, etc.
 *
 * @param {object[]} items Array of items to be looked for in the list
 * @param {object} list The army list to be checked
 * @param {string} excludeId The id of the character/unit with the items, which will be skipped by the check
 * @returns {object[]} List of error messages for item categories that have failed validation
 */
export const combosUsedElsewhere = (items, list, excludeId) => {
  const unitCategories = [
    "characters",
    "core",
    "special",
    "rare",
    "mercenaries",
    "allies",
  ];
  let errors = [];
  let groupedByType = {};
  for (let i in items) {
    let item = items[i];
    groupedByType[item.type] = groupedByType[item.type] || [];
    groupedByType[item.type].push(item);
  }
  for (let itemType in groupedByType) {
    let categoryItems = groupedByType[itemType];
    for (let categoryIndex in unitCategories) {
      let category = unitCategories[categoryIndex];
      for (let i in list[category]) {
        let unit = list[category][i];
        if (unit.id !== excludeId) {
          let collectedItemCombos = [];

          for (let itemGroup in unit.items) {
            // get all items that match the current item's category
            let targetCategoryItems = unit.items[itemGroup].selected.filter(
              (targetItem) => targetItem.type === itemType
            );
            if (targetCategoryItems.length > 0) {
              collectedItemCombos.push({
                itemCombos: targetCategoryItems,
                url: `/editor/${list.id}/${category}/${unit.id}/items/${itemGroup}`,
              });
            }
          }
          for (let commandGroup in unit.command) {
            if (
              unit.command[commandGroup].active &&
              unit.command[commandGroup].magic?.selected
            ) {
              let targetCategoryItems = unit.command[
                commandGroup
              ].magic?.selected.filter(
                (targetItem) => targetItem.type === itemType
              );
              if (targetCategoryItems.length > 0) {
                collectedItemCombos.push({
                  itemCombos: targetCategoryItems,
                  url: `/editor/${list.id}/${category}/${unit.id}/magic/${commandGroup}`,
                });
              }
            }
          }

          for (let j in collectedItemCombos) {
            let targetItemComboObj = collectedItemCombos[j];
            if (targetItemComboObj.itemCombos.length === categoryItems.length) {
              if (
                categoryItems.every((item) =>
                  targetItemComboObj.itemCombos.some(
                    (targetItem) =>
                      item.name_en === targetItem.name_en &&
                      (item.amount || 1) === (targetItem.amount || 1)
                  )
                )
              ) {
                errors.push({
                  category: itemType,
                  unit: unit,
                  url: targetItemComboObj.url,
                });
              }
            }
          }
        }
      }
    }
  }
  return errors;
};
