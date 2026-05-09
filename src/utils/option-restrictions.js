/**
 * Finds all active options with restrictions and checks them against the army list to
 * find any violations.
 * 
 * @param {object} unit The unit to be checked
 * @param {object} list The army list the unit is part of
 * @returns {object} A dictionary of the errors found. key is the option's id,
 * value is an error message object of type {message: string, otherUnits: string[]}
 */
export const checkUnitOptionRestrictions = (unit, list) => {
  const errors = {};
  const categories = [
    "command",
    "equipment",
    "armor",
    "options",
    "mounts",
  ]
  for (let category of categories) {
    if (unit[category] && unit[category].length) {
      for (let option of unit[category]) {
        if (option.active && option.restrictions && option.id) {
          errors[option.id] = checkOptionRestrictions(unit.id, option, list, category);
        }
      }
    }
  }
  return errors;
}

/**
 * Checks whether a specific active option's restrictions are violated by other units in
 * the army list
 * 
 * @param {string} unitId The id of the unit with the option
 * @param {object} option The object definition of the option
 * @param {object} list The army list the unit is a part of
 * @param {string} optionType The category of the option, ie "command", "armor", "options"
 * @returns {{message: string, otherUnits: {url: string, unit: object}[]} || undefined} 
 *    An error message object, with a list of the other units that violate the option's 
 *    restrictions. If there is no error, returns undefined.
 */
export const checkOptionRestrictions = (unitId, option, list, optionType) => {
  if (option.id === undefined) {
    console.log("Options with restrictions require ids");
    return undefined;
  }
  if (option.restrictions?.restrictMagicItems && (option.magic?.selected?.length || 0) < 1) {
    return undefined;
  }
  const type = optionType || "options";

  // Count how many units have this option
  const unitCategories = [
    "characters",
    "core",
    "special",
    "rare",
    "mercenaries",
    "allies",
  ];
  let count = 1;
  let otherUnits = [];
  for (let targetCategory of unitCategories) {
    for (let targetUnit of list[targetCategory]) {
      if (targetUnit.id !== unitId) {
        if (targetUnit[type]) {
          for (let targetOption of targetUnit[type]) {
            let hasOption = targetOption.active && (option.restrictions.ids 
              ? option.restrictions.ids.includes(targetOption.id)
              : targetOption.id === option.id);
            if (option.restrictions.restrictMagicItems) {
              hasOption = hasOption && targetOption.magic?.selected?.length > 0;
            }
            if (hasOption) {
              count += 1;
              otherUnits.push({
                url: `/editor/${list.id}/${targetCategory}/${targetUnit.id}/`,
                unit: targetUnit,
              });
            }
          }
        }
      }
    }
  }
  // Determine if that count exceeds the maximum number allowed.
  // If restriction is poorly formatted and max can't be determined, allow any number.
  let max = Infinity;
  let message = "misc.error.maxOptionPerArmy";
  if (option.restrictions.requires) {
    if (option.restrictions.requires.unitIds) {
      max = 0;
      message = option.restrictions.requires.option
        ? "misc.error.optionRequiresUnitWithOption"
        : "misc.error.optionRequiresUnit";
      for (let unitCandidate of list[option.restrictions.requires.type] || []) {
        if (option.restrictions.requires.unitIds.includes(unitCandidate.id.split('.')[0])) {
          if (option.restrictions.requires.option) {
            const hasOption = unitCandidate[option.restrictions.requires.optionType || "options"]
              .reduce((prev, current) => 
                prev || (current.active && current.id === option.restrictions.requires.option), false);
            if (hasOption) {
              max = option.restrictions.requires.perUnit
                ? max + 1
                : option.restrictions.max;
              message = "misc.error.maxOptionPerArmy";
            }
          } else {
            max = option.restrictions.requires.perUnit
              ? max + 1
              : option.restrictions.max;
            message = "misc.error.maxOptionPerArmy";
          }
        }
      }
    }
  } else if (option.restrictions.points) {
    max = Math.floor(list.points / option.restrictions.points) * option.restrictions.max;
  } else if (option.restrictions.max) {
    max = option.restrictions.max;
  }
  if (count > max) {
    return {
      message,
      otherUnits
    }
  } else {
    return undefined;
  }
}
