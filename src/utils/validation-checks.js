import { getGenerals } from "./army";
import { getUnitRulesByCategory } from "./rules";
import { getUnitPoints } from "./points";
import { equalsOrIncludes } from "./string";
import { getUnitName, getUnitLeadership, getUnitRuleData } from "./unit";

/**
 * An army must include exactly one general.
 */
export const oneGeneral = (list) => {
  const errors = [];
  const generals = getGenerals(list);
  if (generals.length < 1) {
    errors.push({
      message: "misc.error.noGeneral",
      section: "characters",
    });
  } else if (generals.length > 1) {
    errors.push({
      message: "misc.error.multipleGenerals",
      section: "characters",
    });
  }
  return errors;
};

/**
 * An army's general must be chosen from the set of characters with the highest
 * leadership in the army, not including characters ineligible to be the
 * general like Loners.
 */
export const generalLeadership = (list) => {
  const errors = [];
  let highestLeadership = 0;
  const generals = getGenerals(list);

  if (generals.length === 1) {
    if (list?.characters?.length) {
      list.characters.forEach((unit) => {
        if (
          unit.command &&
          unit.command.find(
            (command) =>
              command.name_en === "General" &&
              (!command.armyComposition ||
                equalsOrIncludes(
                  command.armyComposition,
                  list.armyComposition,
                )),
          )
        ) {
          const leadership = getUnitLeadership({ unit, list });

          if (leadership && leadership > highestLeadership) {
            highestLeadership = leadership;
          }
        }
      });
    }
    const unitLeadership = getUnitLeadership({ unit: generals[0], list });

    if (unitLeadership && unitLeadership < highestLeadership) {
      errors.push({
        message: "misc.error.generalLeadership",
        section: "characters",
      });
    }
  }
  return errors;
};

/**
 * An army can have at most one Battle Standard Bearer.
 */
export const maxOneBSB = (list) => {
  const errors = [];
  const BSBs = list.characters?.length
    ? list.characters.filter(
        (unit) =>
          unit.command &&
          unit.command.find(
            (command) =>
              command.active &&
              command.name_en.includes("Battle Standard Bearer"),
          ),
      )
    : [];
  if (BSBs.length > 1) {
    errors.push({
      message: "misc.error.multipleBSBs",
      section: "characters",
    });
  }
  return errors;
};

/**
 * A Tomb Kings list requires a wizard character to be the army's Hierophant.
 * This Hierophant must be chosen from the highest level wizards in the army.
 * If a Tomb King with The Language of the Priests or Settra is included in the
 * army, they must be the Hierophant.
 */
export const hierophantChecks = (list) => {
  const hierophants = !list?.characters?.length
    ? []
    : list.characters.filter(
        (unit) =>
          unit.command &&
          unit.command.find(
            (command) => command.active && command.name_en === "The Hierophant",
          ),
      );

  if (hierophants.length < 1) {
    return [
      {
        message: "misc.error.noHierophant",
        section: "characters",
      },
    ];
  } else if (hierophants.length > 1) {
    return [
      {
        message: "misc.error.multipleHierophants",
        section: "characters",
      },
    ];
  } else {
    let highestLichePriestLevel = 0;
    if (list?.characters?.length) {
      list.characters.forEach((unit) => {
        if (
          unit.command &&
          unit.command?.find(
            (command) =>
              command.name_en === "The Hierophant" &&
              (!command.armyComposition ||
                equalsOrIncludes(
                  command.armyComposition,
                  list.armyComposition,
                )),
          )
        ) {
          // Settra and characters with the "Language of the Priests" option are always the Hierophant
          const hasLanguageOfThePriests =
            (unit.name_en === "Tomb King" || unit.name_en === "Tomb Prince") &&
            unit.command[0].options?.find(
              (option) =>
                option.name_en === "Arise!, Level 1 Wizard" && option.active,
            ) !== undefined;
          const wizardLevel =
            unit.name_en === "Settra the Imperishable" ||
            hasLanguageOfThePriests
              ? 6
              : getWizardLevels(unit).lastIndexOf(1);
          if (wizardLevel && wizardLevel > highestLichePriestLevel) {
            highestLichePriestLevel = wizardLevel;
          }
        }
      });
    }

    const hasLanguageOfThePriests =
      (hierophants[0].name_en === "Tomb King" ||
        hierophants[0].name_en === "Tomb Prince") &&
      hierophants[0].command[0].options?.find(
        (option) =>
          option.name_en === "Arise!, Level 1 Wizard" && option.active,
      ) !== undefined;
    const hierophantLevel =
      hierophants[0].name_en === "Settra the Imperishable" ||
      hasLanguageOfThePriests
        ? 6
        : getWizardLevels(hierophants[0]).lastIndexOf(1);

    if (hierophantLevel < highestLichePriestLevel) {
      return [
        {
          message: "misc.error.hierophantLevel",
          section: "characters",
        },
      ];
    } else {
      return [];
    }
  }
};

export const generalIsHierophant = (list) => {
  const errors = [];
  const generals = getGenerals(list);
  if (generals.length === 1) {
    const isHierophant = generals[0].command.find(
      (command) => command.active && command.name_en === "The Hierophant",
    );
    if (!isHierophant) {
      errors.push({
        message: "misc.error.hierophantGeneral",
        section: "characters",
      });
    }
  }
  return errors;
};

export const generalIsWizard = (list) => {
  const errors = [];
  const generals = getGenerals(list);
  if (generals.length === 1) {
    if (getWizardLevels(generals[0]).lastIndexOf(1) < 0) {
      errors.push({
        message: "misc.error.wizardGeneral",
        section: "characters",
      });
    }
  }
  return errors;
};

/**
 * Factory function for creating validation for whether the army list has a minimum number
 * of non-character units who aren't war machines, swarms, or war beasts.
 */
export function createMinNonCharacters(minNum, notCountedTypes, errorMsg) {
  return (list) => {
    const allUnits = [
      ...(list.core || []),
      ...(list.special || []),
      ...(list.rare || []),
      ...(list.mercenaries || []),
      ...(list.allies || []),
    ];
    const count = allUnits
      .filter((unit) => unit.unitType !== "characters")
      .filter((unit) => {
        const ruleData = getUnitRuleData(unit.name_en);
        return !notCountedTypes.includes(ruleData?.troopType);
      }).length;

    if (count < minNum) {
      return [
        {
          message: errorMsg,
          section: "global",
        },
      ];
    } else {
      return [];
    }
  };
}

/**
 * Factory function for creating checks for if a single unit in the
 * target category exceeds a given point value.
 */
export function createMaxPointsSingleUnit(maxPoints, unitCategory, errorMsg) {
  return (list) => {
    const errors = [];
    list[unitCategory] &&
      list[unitCategory].forEach((unit) => {
        const unitPoints = getUnitPoints(
          { ...unit, type: unitCategory },
          {
            armyComposition: list.armyComposition || list.army,
          },
        );
        if (unitPoints > maxPoints) {
          errors.push({
            message: errorMsg,
            section: unitCategory,
          });
        }
      });
    return errors;
  };
}

/**
 * In Grand Melee, an army can only have 1 level 3 wizard per 1000 points,
 * and 1 level 4 wizard per 2000 points.
 */
export const grandMeleeWizardLimits = (list) => {
  const errors = [];
  const level3Max = Math.floor(list.points / 1000);
  const level4Max = Math.floor(list.points / 2000);
  let characterWizards = [0, 0, 0, 0, 0];
  let specialWizards = [0, 0, 0, 0, 0];
  let rareWizards = [0, 0, 0, 0, 0];
  let totalWizards = [0, 0, 0, 0, 0];

  list?.characters &&
    list.characters.forEach((unit) => {
      getWizardLevels(unit).forEach((numberAtThisLevel, level) => {
        characterWizards[level] += numberAtThisLevel;
        totalWizards[level] += numberAtThisLevel;
      });
    });
  list?.special &&
    list.special.forEach((unit) => {
      getWizardLevels(unit).forEach((numberAtThisLevel, level) => {
        specialWizards[level] += numberAtThisLevel;
        totalWizards[level] += numberAtThisLevel;
      });
    });
  list?.rare &&
    list.rare.forEach((unit) => {
      getWizardLevels(unit).forEach((numberAtThisLevel, level) => {
        rareWizards[level] += numberAtThisLevel;
        totalWizards[level] += numberAtThisLevel;
      });
    });
  if (totalWizards[4] > level4Max) {
    if (characterWizards[4] > 0) {
      errors.push({
        message: "misc.error.grandMeleeLevel4",
        section: "characters",
      });
    }
    if (specialWizards[4] > 0) {
      errors.push({
        message: "misc.error.grandMeleeLevel4",
        section: "special",
      });
    }
    if (rareWizards[4] > 0) {
      errors.push({
        message: "misc.error.grandMeleeLevel4",
        section: "rare",
      });
    }
  }
  if (totalWizards[3] > level3Max) {
    if (characterWizards[3] > 0) {
      errors.push({
        message: "misc.error.grandMeleeLevel3",
        section: "characters",
      });
    }
    if (specialWizards[3] > 0) {
      errors.push({
        message: "misc.error.grandMeleeLevel3",
        section: "special",
      });
    }
    if (rareWizards[3] > 0) {
      errors.push({
        message: "misc.error.grandMeleeLevel3",
        section: "rare",
      });
    }
  }
  return errors;
};

/**
 * In Grand Melee, no single unit can contain more than half the models in the army.
 */
export const grandMeleeMaxModelsSingleUnit = (list) => {
  const unitEntries = getArmyModelEntries(list);
  const totalModels = unitEntries.reduce(
    (total, { models }) => total + models,
    0,
  );

  if (totalModels <= 0) {
    return [];
  }

  return unitEntries
    .filter(({ models }) => models > totalModels / 2)
    .map(({ section }) => ({
      message: "misc.error.grandMelee50Models",
      section,
    }));
};

/**
 * Factory function for creating checks for duplicate units up to a given number
 * in a target category
 */
export function createLimitUnitRepeats(max, unitCategory, errorMsg) {
  return (list, language) => {
    const errors = [];
    const restrictedUnits = [];

    list[unitCategory] &&
      list[unitCategory].forEach((unit) => {
        const unitRules = getUnitRulesByCategory(
          list.armyComposition,
          unitCategory,
        );
        const restrictions = Boolean(
          unitRules &&
            (unitRules.find((ruleUnit) =>
              ruleUnit.ids.includes(unit.id.split(".")[0]),
            )?.max ||
              unitRules.find((ruleUnit) =>
                ruleUnit.ids.includes(unit.id.split(".")[0]),
              )?.min),
        );
        const count = list[unitCategory].filter(
          (targetUnit) =>
            targetUnit.id.split(".")[0] === unit.id.split(".")[0] ||
            hasSharedCombinedArmsLimit(targetUnit, unit),
        ).length;

        if (
          !restrictions &&
          count > max &&
          !restrictedUnits.find(
            (restrictedUnit) => restrictedUnit.id === unit.id.split(".")[0],
          )
        ) {
          restrictedUnits.push({
            id: unit.id.split(".")[0],
            name: getUnitName({ unit, language }),
            section: unitCategory,
            diff: count - max,
          });
        }
      });

    restrictedUnits.forEach((restrictedUnit) => {
      errors.push({
        message: errorMsg,
        section: restrictedUnit.section,
        diff: restrictedUnit.diff,
        name: restrictedUnit.name,
      });
    });
    return errors;
  };
}

// Helper functions for these checks

const hasSharedCombinedArmsLimit = (otherUnit, unitToValidate) => {
  return (
    otherUnit.sharedCombinedArmsUnits &&
    otherUnit.sharedCombinedArmsUnits.includes(unitToValidate.id.split(".")[0])
  );
};

const unitCategories = [
  "lords",
  "heroes",
  "characters",
  "core",
  "special",
  "rare",
  "mercenaries",
  "allies",
];

const getModelCount = (unit) => {
  const modelCount = Number(unit?.strength || unit?.minimum || 1);

  return Number.isFinite(modelCount) ? modelCount : 1;
};

const getArmyModelEntries = (list) => {
  return unitCategories.flatMap((section) =>
    (list[section] || []).flatMap((unit) => [
      {
        section,
        models: getModelCount(unit),
      },
      ...(unit.detachments || []).map((detachment) => ({
        section,
        models: getModelCount(detachment),
      })),
    ]),
  );
};

/**
 * Iterate the target Character or Units Options stored in the target itself, it's Command Group and mounts
 * This is because in some armies (Mainly Daemons), Unit Champions and Mounts can also be high level wizards
 * which can breach validation rules
 */
const getWizardLevels = (unitToCheck) => {
  // Quantity of wizards of each level from 0-4 (though we're only going to be validating 3 & 4)
  let wizardLevels = [0, 0, 0, 0, 0];

  // Check the unit itself
  incrementLevels([unitToCheck], wizardLevels);
  // Check the units champion and mounts
  incrementLevels(unitToCheck.command, wizardLevels);
  incrementLevels(unitToCheck.mounts, wizardLevels);

  return wizardLevels;
};

/**
 * In a single pass recursively find all wizard levels
 */
function incrementLevels(listOfOptionHolders, wizardLevels) {
  if (listOfOptionHolders && listOfOptionHolders.length) {
    listOfOptionHolders
      .filter((optionHolder) => optionHolder.options)
      .flatMap((optionHolder) => optionHolder.options)
      .filter((option) => option.active)
      .forEach((activeOption) => {
        const match = activeOption.name_en
          .toLowerCase()
          .match(/level\s*(\d+)\s*wizard/);
        if (match && match[1]) {
          wizardLevels[parseInt(match[1], 10)]++;
        }
        // Sometimes the options are nested, check them recursively
        activeOption.options && incrementLevels([activeOption], wizardLevels);
      });
  }
}
