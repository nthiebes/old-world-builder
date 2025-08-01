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
export const isMultipleAllowedItem = ({ type, stackable, maximum }) =>
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
 * Checks if non-extremely common items are used elsewhere in a list
 * 
 * @param {object[]} items Array of magic items to be looked for in the list
 * @param {object} list The army list to be checked
 * @param {string} excludeId The id of the character/unit with the items, which will be skipped by the check
 * @returns {object[]} List of error messages for items that have failed validation
 */
export const itemsUsedElsewhere = (items, list, excludeId) => {
  let combinedUnits = [].concat(list.characters, list.core, list.special, list.rare, list.mercenaries);
  let errors = [];
  for (let i in items) {
    let item = items[i];
    if (item.stackable !== true) {
      for (let j in combinedUnits) {
        let unit = combinedUnits[j];
        if (unit.id !== excludeId) {
          let allItems = [];
          if (unit.items?.length > 0) {
            allItems = allItems.concat(unit.items.map((group) => group.selected || []).flat());
          }
          if (unit.command?.length > 0) {
            allItems = allItems.concat(unit.command.map((command) => command.magic?.selected || []).flat());
          }
          for (let targetItem in allItems) {
            if (allItems[targetItem].name_en === item.name_en) {
              errors.push(
                {
                  itemID: item.name_en,
                  unit: unit,
                }
              );
            }
          }
        }
      }
    }
  }
  return errors
}
