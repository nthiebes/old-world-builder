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
  let unit_categories = ['characters', 'core', 'special', 'rare', 'mercenaries', 'allies'];
  let errors = [];
  for (let i in items) {
    let item = items[i];
    if (item.onePerArmy === true) {
      for (let category_index in unit_categories) {
        let category = unit_categories[category_index];
        for (let j in list[category]) {
          let unit = list[category][j];
          if (unit.id !== excludeId) {
            for (let itemGroup in unit.items) {
              for (let targetItem in unit.items[itemGroup].selected) {
                if (unit.items[itemGroup].selected[targetItem].name_en === item.name_en) {
                  errors.push(
                    {
                      itemName: item.name_en,
                      unit: unit,
                      url: `/editor/${list.id}/${category}/${unit.id}/items/${itemGroup}`
                    }
                  );
                }
              }
            }
            for (let commandGroup in unit.command) {
              if (unit.command[commandGroup].active) {
                for (let targetItem in unit.command[commandGroup].magic?.selected) {
                  if (unit.command[commandGroup].magic.selected[targetItem].name_en === item.name_en) {
                    errors.push(
                      {
                        itemName: item.name_en,
                        unit: unit,
                        url: `/editor/${list.id}/${category}/${unit.id}/magic/${commandGroup}`
                      }
                    );
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
}
