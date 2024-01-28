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
