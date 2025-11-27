import { rules } from "./rules";
import { uniq } from "./collection";
import { equalsOrIncludes } from "./string";
import { getUnitPoints } from "./points";
import { getUnitName, getUnitLeadership, getUnitRuleData } from "./unit";
import { joinWithAnd, joinWithOr } from "./string";

const filterByTroopType = (unit) => {
  const ruleData = getUnitRuleData(unit.name_en);
  return [
    "MCa",
    "LCa",
    "HCa",
    "MI",
    "RI",
    "HI",
    "HCh",
    "LCh",
    "MCr",
    "Be",
  ].includes(ruleData?.troopType);
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

const hasSharedCombinedArmsLimit = (otherUnit, unitToValidate) => {
  return (
    otherUnit.sharedCombinedArmsUnits &&
    otherUnit.sharedCombinedArmsUnits.includes(unitToValidate.id.split(".")[0])
  );
};

export const validateList = ({ list, language, intl }) => {
  const errors = [];
  const generals = !list?.characters?.length
    ? []
    : list.characters.filter(
        (unit) =>
          unit.command &&
          unit.command.find(
            (command) => command.active && command.name_en === "General"
          )
      );
  // The general must be one of the characters with the highest leadership
  let highestLeadership = 0;
  if (list?.characters?.length) {
    list.characters.forEach((unit) => {
      if (
        unit.command &&
        unit.command.find(
          (command) =>
            command.name_en === "General" &&
            (!command.armyComposition ||
              equalsOrIncludes(command.armyComposition, list.armyComposition))
        )
      ) {
        const unitName =
          unit.name_en.includes("renegade") &&
          list.armyComposition?.includes("renegade")
            ? unit.name_en
            : unit.name_en.replace(" {renegade}", "");
        const leadership = getUnitLeadership(unitName);

        if (leadership && leadership > highestLeadership) {
          highestLeadership = leadership;
        }
      }
    });
  }

  const BSBs = !list.characters?.length
    ? []
    : list.characters.filter(
        (unit) =>
          unit.command &&
          unit.command.find(
            (command) =>
              command.active &&
              command.name_en.includes("Battle Standard Bearer")
          )
      );

  const coreUnits = list?.core?.length
    ? list.core.filter(filterByTroopType).length
    : 0;
  let coreUnitsDetachmentCount = 0;

  if (list?.core?.length) {
    list.core.forEach((unit) => {
      if (unit.detachments && unit.detachments.length) {
        coreUnitsDetachmentCount +=
          unit.detachments.filter(filterByTroopType).length;
      }
    });
  }

  const specialUnits = list?.special?.length
    ? list.special.filter(filterByTroopType).length
    : 0;
  const rareUnits = list?.rare?.length
    ? list.rare.filter(filterByTroopType).length
    : 0;
  const mercUnits = list?.mercenaries?.length
    ? list.mercenaries.filter(filterByTroopType).length
    : 0;
  const allyUnits = list?.allies?.length
    ? list.allies
        .filter((unit) => unit.unitType !== "characters")
        .filter(filterByTroopType).length
    : 0;
  const generalsCount = generals.length;
  const BSBsCount = BSBs.length;
  const nonCharactersCount =
    coreUnits +
    coreUnitsDetachmentCount +
    specialUnits +
    rareUnits +
    mercUnits +
    allyUnits;
  const characterUnitsRules = rules[list.armyComposition]
    ? rules[list.armyComposition].characters.units
    : rules["grand-army"].characters.units;
  const coreUnitsRules = rules[list.armyComposition]
    ? rules[list.armyComposition].core.units
    : rules["grand-army"].core.units;
  const specialUnitsRules = rules[list.armyComposition]
    ? rules[list.armyComposition].special.units
    : rules["grand-army"].special.units;
  const rareUnitsRules = rules[list.armyComposition]
    ? rules[list.armyComposition].rare.units
    : rules["grand-army"].rare.units;
  const alliesUnitsRules = rules[list.armyComposition]
    ? rules[list.armyComposition]?.allies?.units
    : rules["grand-army"]?.allies?.units;
  const mercenariesUnitsRules = rules[list.armyComposition]
    ? rules[list.armyComposition]?.mercenaries?.units
    : rules["grand-army"]?.mercenaries?.units;

  // Not enough non-character units
  if (!list.compositionRule || !list.compositionRule.includes("battle-march")) {
    if (nonCharactersCount < 3) {
      errors.push({
        message: "misc.error.notEnoughNonCharacters",
        section: "global",
      });
    }
  } else {
    if (nonCharactersCount < 2) {
      errors.push({
        message: "misc.error.notEnoughNonCharactersBattleMarch",
        section: "global",
      });
    }
  }

  // No general
  generalsCount === 0 &&
    errors.push({
      message: "misc.error.noGeneral",
      section: "characters",
    });

  // Multiple generals
  generalsCount > 1 &&
    errors.push({
      message: "misc.error.multipleGenerals",
      section: "characters",
    });

  // General doesn't have highest leadership in the army
  const unitLeadership =
    generalsCount === 1 && getUnitLeadership(generals[0].name_en);

  generalsCount === 1 &&
    unitLeadership &&
    unitLeadership < highestLeadership &&
    errors.push({
      message: "misc.error.generalLeadership",
      section: "characters",
    });

  // Multiple BSBs
  BSBsCount > 1 &&
    errors.push({
      message: "misc.error.multipleBSBs",
      section: "characters",
    });

  // Grand Melee
  if (list.compositionRule && list.compositionRule.includes("grand-melee")) {
    const checkFor25Percent = (unit, type) => {
      const unitPoints = getUnitPoints(
        { ...unit, type },
        {
          armyComposition: list.armyComposition || list.army,
        }
      );

      if (unitPoints > list.points / 4) {
        errors.push({
          message: "misc.error.grandMelee25",
          section: type,
        });
      }
    };
    const level3Max = Math.floor(list.points / 1000);
    const level4Max = Math.floor(list.points / 2000);
    let characterWizards = [0, 0, 0, 0, 0];
    let specialWizards = [0, 0, 0, 0, 0];
    let rareWizards = [0, 0, 0, 0, 0];
    let totalWizards = [0, 0, 0, 0, 0];

    list?.characters &&
      list.characters.forEach((unit) => {
        checkFor25Percent(unit, "characters");
        let characterWizard = getWizardLevels(unit);
        characterWizard.forEach((numberAtThisLevel, level) => {
          if (numberAtThisLevel > 0) {
            characterWizards[level] += numberAtThisLevel;
            totalWizards[level] += numberAtThisLevel;
          }
        });
      });
    list?.core &&
      list.core.forEach((unit) => {
        checkFor25Percent(unit, "core");
      });
    list?.special &&
      list.special.forEach((unit) => {
        checkFor25Percent(unit, "special");
        let specialWizard = getWizardLevels(unit);
        specialWizard.forEach((numberAtThisLevel, level) => {
          if (numberAtThisLevel > 0) {
            specialWizards[level] += numberAtThisLevel;
            totalWizards[level] += numberAtThisLevel;
          }
        });
      });
    list?.rare &&
      list.rare.forEach((unit) => {
        checkFor25Percent(unit, "rare");
        let rareWizard = getWizardLevels(unit);
        rareWizard.forEach((numberAtThisLevel, level) => {
          if (numberAtThisLevel > 0) {
            rareWizards[level] += numberAtThisLevel;
            totalWizards[level] += numberAtThisLevel;
          }
        });
      });
    list?.mercenaries &&
      list.mercenaries.forEach((unit) => {
        checkFor25Percent(unit, "mercenaries");
      });
    list?.allies &&
      list.allies.forEach((unit) => {
        checkFor25Percent(unit, "allies");
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
  }

  // Combined Arms
  if (list.compositionRule && list.compositionRule.includes("combined-arms")) {
    const charactersMax =
      Math.max(Math.floor((list.points - 2000) / 1000), 0) + 3;
    const coreMax = Math.max(Math.floor((list.points - 2000) / 1000), 0) + 4;
    const specialMax = Math.max(Math.floor((list.points - 2000) / 1000), 0) + 3;
    const rareAndMercMax =
      Math.max(Math.floor((list.points - 2000) / 1000), 0) + 2;
    const restrictedUnits = [];

    // Characters
    list.characters.forEach((unit) => {
      const characterRestricted = Boolean(
        characterUnitsRules &&
          characterUnitsRules.find((ruleUnit) =>
            ruleUnit.ids.includes(unit.id.split(".")[0])
          )?.max
      );
      const characterCount = list.characters.filter(
        (character) => character.id.split(".")[0] === unit.id.split(".")[0]
      ).length;

      if (
        !characterRestricted &&
        !unit.named &&
        characterCount > charactersMax &&
        !restrictedUnits.find(
          (restrictedUnit) => restrictedUnit.id === unit.id.split(".")[0]
        )
      ) {
        restrictedUnits.push({
          id: unit.id.split(".")[0],
          name: getUnitName({ unit, language }),
          section: "characters",
          diff: characterCount - charactersMax,
        });
      }
    });

    // Core
    list.core.forEach((unit) => {
      const coreRestricted = Boolean(
        coreUnitsRules &&
          coreUnitsRules.find((ruleUnit) =>
            ruleUnit.ids.includes(unit.id.split(".")[0])
          )?.max
      );
      const coreCount = list.core.filter(
        (core) =>
          core.id.split(".")[0] === unit.id.split(".")[0] ||
          hasSharedCombinedArmsLimit(core, unit)
      ).length;

      if (
        !coreRestricted &&
        coreCount > coreMax &&
        !restrictedUnits.find(
          (restrictedUnit) => restrictedUnit.id === unit.id.split(".")[0]
        )
      ) {
        restrictedUnits.push({
          id: unit.id.split(".")[0],
          name: getUnitName({ unit, language }),
          section: "core",
          diff: coreCount - coreMax,
        });
      }
    });

    // Special
    list.special.forEach((unit) => {
      const specialRestricted = Boolean(
        specialUnitsRules &&
          specialUnitsRules.find((ruleUnit) =>
            ruleUnit.ids.includes(unit.id.split(".")[0])
          )?.max
      );
      const specialCount = list.special.filter(
        (special) => special.id.split(".")[0] === unit.id.split(".")[0]
      ).length;

      if (
        !specialRestricted &&
        specialCount > specialMax &&
        !restrictedUnits.find(
          (restrictedUnit) => restrictedUnit.id === unit.id.split(".")[0]
        )
      ) {
        restrictedUnits.push({
          id: unit.id.split(".")[0],
          name: getUnitName({ unit, language }),
          section: "special",
          diff: specialCount - specialMax,
        });
      }
    });

    // Rare
    list.rare.forEach((unit) => {
      const rareRestricted = Boolean(
        rareUnitsRules &&
          rareUnitsRules.find((ruleUnit) =>
            ruleUnit.ids.includes(unit.id.split(".")[0])
          )?.max
      );
      const rareCount = list.rare.filter(
        (rare) => rare.id.split(".")[0] === unit.id.split(".")[0]
      ).length;

      if (
        !rareRestricted &&
        rareCount > rareAndMercMax &&
        !restrictedUnits.find(
          (restrictedUnit) => restrictedUnit.id === unit.id.split(".")[0]
        )
      ) {
        restrictedUnits.push({
          id: unit.id.split(".")[0],
          name: getUnitName({ unit, language }),
          section: "rare",
          diff: rareCount - rareAndMercMax,
        });
      }
    });

    // Mercenaries
    list.mercenaries.forEach((unit) => {
      const mercRestricted = Boolean(
        mercenariesUnitsRules &&
          mercenariesUnitsRules.find((ruleUnit) =>
            ruleUnit.ids.includes(unit.id.split(".")[0])
          )?.max
      );
      const mercCount = list.mercenaries.filter(
        (merc) => merc.id.split(".")[0] === unit.id.split(".")[0]
      ).length;

      if (
        !mercRestricted &&
        mercCount > rareAndMercMax &&
        !restrictedUnits.find(
          (restrictedUnit) => restrictedUnit.id === unit.id.split(".")[0]
        )
      ) {
        restrictedUnits.push({
          id: unit.id.split(".")[0],
          name: getUnitName({ unit, language }),
          section: "mercenaries",
          diff: mercCount - rareAndMercMax,
        });
      }
    });

    restrictedUnits.forEach((restrictedUnit) => {
      errors.push({
        message: "misc.error.maxUnits",
        section: restrictedUnit.section,
        diff: restrictedUnit.diff,
        name: restrictedUnit.name,
      });
    });
  }

  // Battle March
  if (list.compositionRule && list.compositionRule.includes("battle-march")) {
    // Neither player can spend more than 25% of their total points on a single character.
    list?.characters &&
      list.characters.forEach((unit) => {
        const unitPoints = getUnitPoints(
          { ...unit, type: "characters" },
          {
            armyComposition: list.armyComposition || list.army,
          }
        );
        if (unitPoints > list.points / 4) {
          errors.push({
            message: "misc.error.battleMarch25PercentPerCharacter",
            section: "characters",
          });
        }
      });

    // Neither player can spend more than 35% of their total points on a single core unit.
    list?.core &&
      list.core.forEach((unit) => {
        const unitPoints = getUnitPoints(
          { ...unit, type: "core" },
          {
            armyComposition: list.armyComposition || list.army,
            noDetachments: true,
          }
        );
        if (unitPoints > list.points * 0.35) {
          errors.push({
            message: "misc.error.battleMarch35PercentPerCore",
            section: "core",
          });
        }
      });
    // Neither player can spend more than 30% of their total points on a single special unit.
    list.special &&
      list.special.forEach((unit) => {
        const unitPoints = getUnitPoints(
          { ...unit, type: "special" },
          {
            armyComposition: list.armyComposition || list.army,
            noDetachments: true,
          }
        );
        if (unitPoints > list.points * 0.3) {
          errors.push({
            message: "misc.error.battleMarch30PercentPerSpecial",
            section: "special",
          });
        }
      });
    // Neither player can spend more than 25% of their total points on a single rare or mercenary unit.
    list.rare &&
      list.rare.forEach((unit) => {
        const unitPoints = getUnitPoints(
          { ...unit, type: "rare" },
          {
            armyComposition: list.armyComposition || list.army,
            noDetachments: true,
          }
        );
        if (unitPoints > list.points * 0.25) {
          errors.push({
            message: "misc.error.battleMarch25PercentPerRare",
            section: "rare",
          });
        }
      });
    list.mercenaries &&
      list.mercenaries.forEach((unit) => {
        const unitPoints = getUnitPoints(
          { ...unit, type: "mercenaries" },
          {
            armyComposition: list.armyComposition || list.army,
            noDetachments: true,
          }
        );
        if (unitPoints > list.points * 0.25) {
          errors.push({
            message: "misc.error.battleMarch25PercentPerMercenary",
            section: "mercenaries",
          });
        }
      });
  }

  let used0XUnits = [];

  const checkRules = ({ ruleUnit, type }) => {
    const unitsInList = (
      ruleUnit?.requiredByType === "all"
        ? [...list.characters, ...list.core, ...list.special, ...list.rare]
        : list[type]
    ).filter(
      (unit) => ruleUnit.ids && ruleUnit.ids.includes(unit.id.split(".")[0])
    );
    const requiredUnitsInList =
      ruleUnit.requiresType &&
      (ruleUnit.requiresType === "all"
        ? [...list.characters, ...list.core, ...list.special, ...list.rare]
        : list[ruleUnit.requiresType]
      ).filter(
        (unit) =>
          ruleUnit.requires && ruleUnit.requires.includes(unit.id.split(".")[0])
      );
    const namesInList = joinWithOr(
      uniq(unitsInList.map((unit) => getUnitName({ unit, language })))
    );
    const unitNames =
      ruleUnit.min > 0 &&
      joinWithOr(
        uniq(
          ruleUnit.ids.map((id) => {
            const name = intl.formatMessage({ id });

            return getUnitName({ unit: { name }, language });
          })
        )
      );
    const requiredNames =
      ruleUnit.requires &&
      joinWithOr(
        uniq(
          ruleUnit.requires.map((id) => {
            const name = intl.formatMessage({ id });

            return getUnitName({ unit: { name }, language });
          })
        )
      );
    const points = ruleUnit.points;
    const min = points
      ? Math.floor(list.points / points) * ruleUnit.min
      : ruleUnit.min;
    const max = points
      ? Math.floor(list.points / points) * ruleUnit.max
      : ruleUnit.max;

    // Not enough units
    if (
      (!ruleUnit.requires || (ruleUnit.requires && ruleUnit.requiresGeneral)) &&
      unitsInList.length < min
    ) {
      errors.push({
        message: "misc.error.minUnits",
        section: type,
        name: unitNames,
        min,
      });
    }

    // Too many units
    if (
      (!ruleUnit.requires || (ruleUnit.requires && ruleUnit.requiresGeneral)) &&
      unitsInList.length > max &&
      ((list.compositionRule && // Exception for Battle March 0-X units
        !list.compositionRule.includes("battle-march")) ||
        !list.compositionRule)
    ) {
      errors.push({
        message: "misc.error.maxUnits",
        section: type,
        name: namesInList,
        diff: unitsInList.length - max,
      });
    }

    // 0-X units check for Battle March
    if (
      (!ruleUnit.requires || (ruleUnit.requires && ruleUnit.requiresGeneral)) &&
      unitsInList.length > max &&
      list.compositionRule &&
      list.compositionRule.includes("battle-march") &&
      used0XUnits.length > 1
    ) {
      errors.push({
        message: "misc.error.battleMarchMultiple0XUnits",
        section: type,
      });
    }

    // Unit requires general
    if (ruleUnit.requiresGeneral && unitsInList.length > 0) {
      const matchingGeneral = generals.find((general) => {
        return ruleUnit.requires.includes(general.id.split(".")[0]);
      });

      !matchingGeneral &&
        errors.push({
          message: "misc.error.requiresGeneral",
          section: type,
          name: requiredNames,
        });

      // Unit requires general with specific active option
      if (ruleUnit.requiresOption) {
        const generalWithOption = generals
          .filter(
            (general) =>
              ruleUnit.requiresOption.unit === general.id.split(".")[0]
          )
          .find((general) =>
            general.options.find(
              (option) =>
                option.id === ruleUnit.requiresOption.id && option.active
            )
          );

        if (
          !generalWithOption &&
          matchingGeneral &&
          matchingGeneral.id.split(".")[0] === ruleUnit.requiresOption.unit
        ) {
          errors.push({
            message: "misc.error.requiresOption",
            section: type,
            name: intl.formatMessage({ id: ruleUnit.requiresOption.unit }),
            option: intl.formatMessage({ id: ruleUnit.requiresOption.id }),
          });
        }
      }
    }

    // General requires unit (especially for the renegade rules)
    if (ruleUnit.requiresIfGeneral && generals.length > 0) {
      const requiredUnitsByGeneralInList = [
        ...list.characters,
        ...list.core,
        ...list.special,
        ...list.rare,
      ].filter(
        (unit) =>
          ruleUnit.requiresIfGeneral &&
          ruleUnit.requiresIfGeneral.includes(unit.id.split(".")[0])
      );
      if (requiredUnitsByGeneralInList.length === 0) {
        errors.push({
          message: "misc.error.requiresUnits",
          section: type,
          name: ruleUnit.requiresIfGeneral,
          diff: 1,
        });
      }
    }

    // Unit should be mounted
    if (ruleUnit.requiresMounted && unitsInList.length > 0) {
      const charactersNotMounted = unitsInList.filter(
        (character) =>
          !Boolean(
            character.mounts.find(
              (mount) => mount.active && mount.name_en !== "On foot"
            )
          )
      );
      const requiredNames = joinWithAnd(
        charactersNotMounted.map((unit) => getUnitName({ unit, language }))
      );

      charactersNotMounted.length &&
        errors.push({
          message: "misc.error.requiresMounted",
          section: type,
          name: requiredNames,
        });
    }

    // Unit requires specific active option
    if (ruleUnit.requiresOption) {
      const charactersInList = unitsInList.filter(
        (character) =>
          ruleUnit.requiresOption.unit === character.id.split(".")[0]
      );
      const characterWithOption = charactersInList.find((character) =>
        character.options.find(
          (option) => option.id === ruleUnit.requiresOption.id && option.active
        )
      );

      if (charactersInList.length && !characterWithOption) {
        errors.push({
          message: "misc.error.requiresOption",
          section: type,
          name: intl.formatMessage({ id: ruleUnit.requiresOption.unit }),
          option: intl.formatMessage({ id: ruleUnit.requiresOption.id }),
        });
      }
    }

    // Unit requires specific active command
    if (ruleUnit.requiresCommand) {
      const charactersInList = unitsInList.filter(
        (character) =>
          ruleUnit.requiresCommand.unit === character.id.split(".")[0]
      );
      const characterWithCommand = charactersInList.find((character) =>
        character.commands.find(
          (command) =>
            command.id === ruleUnit.requiresCommand.id && command.active
        )
      );

      if (charactersInList.length && !characterWithCommand) {
        errors.push({
          message: "misc.error.requiresCommand",
          section: type,
          name: intl.formatMessage({ id: ruleUnit.requiresCommand.unit }),
          command: intl.formatMessage({ id: ruleUnit.requiresCommand.id }),
        });
      }
    }

    // Requires other unit
    if (!ruleUnit.requiresGeneral && ruleUnit.requires) {
      if (!max && ruleUnit.perUnit && unitsInList.length < min) {
        errors.push({
          message: "misc.error.minUnits",
          section: type,
          name: unitNames,
          min,
        });
      }

      // Each other unit allows another unit
      if (
        max &&
        ruleUnit.perUnit &&
        unitsInList.length > requiredUnitsInList.length * max
      ) {
        errors.push({
          message: "misc.error.requiresUnits",
          section: type,
          name: requiredNames,
          diff: unitsInList.length - requiredUnitsInList.length * max,
        });
        // Each other unit allows another unit with scaling max value
      } else if (
        !max &&
        ruleUnit.perUnit &&
        unitsInList.length > requiredUnitsInList.length + min
      ) {
        errors.push({
          message: "misc.error.requiresUnits",
          section: type,
          name: requiredNames,
          diff: unitsInList.length - requiredUnitsInList.length - min,
        });
      } else if (
        !ruleUnit.perUnit &&
        !requiredUnitsInList.length &&
        unitsInList.length > 0
      ) {
        errors.push({
          message: "misc.error.requiresUnits",
          section: type,
          name: requiredNames,
          diff: 1,
        });
      }
      if (!ruleUnit.perUnit && unitsInList.length > max) {
        errors.push({
          message: "misc.error.maxUnits",
          section: type,
          name: namesInList,
          diff: unitsInList.length - max,
        });
      }
    }

    // Requires magic item
    if (ruleUnit.requiresMagicItem && unitsInList.length > 0) {
      let hasMagicItem;

      generals.forEach((unit) => {
        unit.items.forEach((itemCategory) => {
          if (
            itemCategory.selected.find(
              (item) => item.name === ruleUnit.requiresMagicItem
            )
          ) {
            hasMagicItem = true;
          }
        });
      });

      !hasMagicItem &&
        errors.push({
          message: "misc.error.requiresMagicItem",
          section: type,
          name: intl.formatMessage({ id: ruleUnit.requiresMagicItem }),
        });
    }
  };

  // Marking used 0-X per 1000 pts units for Battle March
  const checkFor0XRules = ({ ruleUnit, type }) => {
    const unitsInList = (
      ruleUnit?.requiredByType === "all"
        ? [...list.characters, ...list.core, ...list.special, ...list.rare]
        : list[type]
    ).filter(
      (unit) => ruleUnit.ids && ruleUnit.ids.includes(unit.id.split(".")[0])
    );

    if (
      ruleUnit.max > 0 &&
      ruleUnit.points === 1000 &&
      unitsInList.length > 0
    ) {
      used0XUnits = [
        ...used0XUnits,
        ...unitsInList.map((unit) => unit.id.split(".")[0]),
      ];
    }
  };

  characterUnitsRules &&
    characterUnitsRules.forEach((ruleUnit) => {
      checkFor0XRules({ ruleUnit, type: "characters" });
    });

  coreUnitsRules &&
    coreUnitsRules.forEach((ruleUnit) => {
      checkFor0XRules({ ruleUnit, type: "core" });
    });

  specialUnitsRules &&
    specialUnitsRules.forEach((ruleUnit) => {
      checkFor0XRules({ ruleUnit, type: "special" });
    });

  rareUnitsRules &&
    rareUnitsRules.forEach((ruleUnit) => {
      checkFor0XRules({ ruleUnit, type: "rare" });
    });

  alliesUnitsRules &&
    alliesUnitsRules.forEach((ruleUnit) => {
      checkFor0XRules({ ruleUnit, type: "allies" });
    });

  mercenariesUnitsRules &&
    mercenariesUnitsRules.forEach((ruleUnit) => {
      checkFor0XRules({ ruleUnit, type: "mercenaries" });
    });

  characterUnitsRules &&
    characterUnitsRules.forEach((ruleUnit) => {
      checkRules({ ruleUnit, type: "characters" });
    });

  coreUnitsRules &&
    coreUnitsRules.forEach((ruleUnit) => {
      checkRules({ ruleUnit, type: "core" });
    });

  specialUnitsRules &&
    specialUnitsRules.forEach((ruleUnit) => {
      checkRules({ ruleUnit, type: "special" });
    });

  rareUnitsRules &&
    rareUnitsRules.forEach((ruleUnit) => {
      checkRules({ ruleUnit, type: "rare" });
    });

  alliesUnitsRules &&
    alliesUnitsRules.forEach((ruleUnit) => {
      checkRules({ ruleUnit, type: "allies" });
    });

  mercenariesUnitsRules &&
    mercenariesUnitsRules.forEach((ruleUnit) => {
      checkRules({ ruleUnit, type: "mercenaries" });
    });

  return errors;
};
