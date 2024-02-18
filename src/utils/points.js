/** @typedef {import('../../types').ArmyList} ArmyList */
/** @typedef {import('../../types').Category} Category */
/** @typedef {import('../../types').Unit} Unit */

import { sum } from "./math";
import { categories, isDetachment } from "./unit";
import { getMaxPercent, getMinPercent } from "./rules";

/**
 * Sum all points from the items multiplied by their amounts.
 *
 * @param {Array<{amount?: number; points: number} | undefined> | undefined} items
 */
export const sumAmountPoints = (items) =>
  sum(
    items?.filter(Boolean) ?? [],
    (option) => (option.amount ?? 1) * option.points
  );

/**
 * Sums the points of a unit,
 * including weapon and command options, selected magic items etc.
 *
 * @param {Unit} unit
 */
export const sumUnitPoints = (unit) =>
  // We concat all subdivided points of this unit
  sumAmountPoints(
    [
      // basic unit strength points
      { amount: unit.strength || 1, points: unit.points },

      // options
      unit.options?.filter(onlyActive).map(withOptionAmount(unit.strength)),
      // equipment
      unit.equipment?.filter(onlyActive).map(withAmount(unit.strength)),
      // armor
      unit.armor?.filter(onlyActive).map(withAmount(unit.strength)),
      // mounts
      unit.mounts?.filter(onlyActive),

      // command options
      !isDetachment(unit)
        ? unit.command
            ?.filter(onlyActive)
            .map((command) => [
              command,
              command.options,
              command.magic?.selected,
            ])
        : undefined,

      // magic items
      unit.items?.map(({ selected }) => selected),

      // detachments
      unit.detachments?.map(
        ({ points, strength, equipment, armor, options }) => [
          // basic detachment strength points
          { points, amount: strength },
          // detachment equipment
          equipment?.map(withAmount(strength)),
          // detachment armor
          armor?.map(withAmount(strength)),
          // detachment options
          options?.map(withAmount(strength)),
        ]
      ),
    ].flat(3)
  );

const onlyActive = (item) => Boolean(item?.active);

const withAmount = (amount) => (option) => ({
  ...option,
  amount,
});

const withOptionAmount =
  (strength) =>
  ({ perModel, stackable, stackableCount, minimum, ...option }) => ({
    ...option,
    amount: perModel
      ? strength
      : stackable
      ? stackableCount || minimum
      : undefined,
  });

/**
 * Get all points within a category.
 *
 * @param {ArmyList} armyList
 * @param {Category} category
 */
export const sumCategoryPoints = (armyList, category) =>
  sum(armyList[category] ?? [], sumUnitPoints);

/**
 * The total amount of points spend in this army list.
 *
 * @param {ArmyList} armyList
 */
export const sumArmyListPoints = (armyList) =>
  sum(categories, (category) => sumCategoryPoints(armyList, category));

/**
 * Get the amount of points for this army list left to spend.
 *
 * @param {ArmyList} armyList
 */
export const getArmyListLeftPoints = (armyList) =>
  armyList.points - sumArmyListPoints(armyList);

/**
 * Get all points within a category.
 *
 * @param {Category} category
 * @param {ArmyList} armyList
 */
export const getAvailablePoints = (armyList, category) =>
  getMaxPercent(category, armyList.armyComposition) * armyList.points -
  sumCategoryPoints(armyList, category);

/**
 * Get all points within a category.
 *
 * @param {Category} category
 * @param {ArmyList} armyList
 */
export const getRequiredPoints = (armyList, category) =>
  getMinPercent(category, armyList.armyComposition) * armyList.points;
