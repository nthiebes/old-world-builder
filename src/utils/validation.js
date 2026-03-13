import { rules } from "./rules";
import { uniq } from "./collection";
import { equalsOrIncludes } from "./string";
import { getUnitPoints } from "./points";
import { getUnitName, getUnitLeadership, getUnitRuleData } from "./unit";
import { joinWithAnd, joinWithOr } from "./string";

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

/**
 * Gets all characters with the General command option active
 */
const getGenerals = (list) =>
  list?.characters?.length
    ? list.characters.filter(
        (unit) =>
          unit.command &&
          unit.command.find(
            (command) => command.active && command.name_en === "General",
          ),
      )
    : [];

const getUnitRulesByCategory = (armyComp, category) => 
  rules[armyComp] 
    ? (rules[armyComp][category]?.units || [])
    : (rules["grand-army"][category]?.units || []);

const hasSharedCombinedArmsLimit = (otherUnit, unitToValidate) => {
  return (
    otherUnit.sharedCombinedArmsUnits &&
    otherUnit.sharedCombinedArmsUnits.includes(unitToValidate.id.split(".")[0])
  );
};

export const validateList = ({ list, language, intl }) => {
  let errors = [];

  let checks = [
    oneGeneral,
    generalLeadership,
    maxOneBSB,
  ];
  if (list.compositionRule && list.compositionRule.includes("grand-melee")) {
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "characters", "misc.error.grandMelee25"));
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "core", "misc.error.grandMelee25"));
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "special", "misc.error.grandMelee25"));
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "rare", "misc.error.grandMelee25"));
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "mercenaries", "misc.error.grandMelee25"));
    checks.push(grandMeleeWizardLimits);
  }
  if (list.compositionRule && list.compositionRule.includes("combined-arms")) {
    const additionalUnits = Math.max(Math.floor((list.points - 2000) / 1000), 0);
    checks.push(makeLimitUnitRepeats(3 + additionalUnits, "characters", "misc.error.maxUnits"));
    checks.push(makeLimitUnitRepeats(4 + additionalUnits, "core", "misc.error.maxUnits"));
    checks.push(makeLimitUnitRepeats(3 + additionalUnits, "special", "misc.error.maxUnits"));
    checks.push(makeLimitUnitRepeats(2 + additionalUnits, "rare", "misc.error.maxUnits"));
    checks.push(makeLimitUnitRepeats(2 + additionalUnits, "mercenaries", "misc.error.maxUnits"));
  }
  if (list.compositionRule && list.compositionRule.includes("battle-march")) {
    checks.push(makeMinNonCharacters(2, ["WB", "Sw"], "misc.error.notEnoughNonCharactersBattleMarch"));
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "characters", "misc.error.battleMarch25PercentPerCharacter"));
    checks.push(makeMaxPointsSingleUnit(.35 * list.points, "core", "misc.error.battleMarch35PercentPerCore"));
    checks.push(makeMaxPointsSingleUnit(.30 * list.points, "special", "misc.error.battleMarch30PercentPerSpecial"));
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "rare", "misc.error.battleMarch25PercentPerRare"));
    checks.push(makeMaxPointsSingleUnit(.25 * list.points, "mercenaries", "misc.error.battleMarch25PercentPerMercenary"));
  } else {
    checks.push(makeMinNonCharacters(3, ["WM", "WB", "Sw"], "misc.error.notEnoughNonCharacters"));
  }
  if (list?.army === "tomb-kings-of-khemri") {
    checks.push(hierophantChecks);
  }
  if (list?.army === "vampire-counts") {
    checks.push(generalIsWizard);
  }
  for (let check of checks) {
    errors = errors.concat(check(list, language, intl));
  }

  let used0XUnits = [];

  const checkRules = ({ ruleUnit, type }) => {
    const generals = getGenerals(list);
    const unitsInList = (
      ruleUnit?.requiredByType === "all"
        ? [...list.characters, ...list.core, ...list.special, ...list.rare]
        : list[type]
    ).filter(
      (unit) => ruleUnit.ids && ruleUnit.ids.includes(unit.id.split(".")[0]),
    );
    const requiredUnitsInList =
      ruleUnit.requiresType &&
      (ruleUnit.requiresType === "all"
        ? [...list.characters, ...list.core, ...list.special, ...list.rare]
        : list[ruleUnit.requiresType]
      ).filter(
        (unit) =>
          ruleUnit.requires &&
          ruleUnit.requires.includes(unit.id.split(".")[0]),
      );
    const namesInList = joinWithOr(
      uniq(unitsInList.map((unit) => getUnitName({ unit, language }))),
    );
    const unitNames =
      ruleUnit.min > 0 &&
      joinWithOr(
        uniq(
          ruleUnit.ids.map((id) => {
            const name = intl.formatMessage({ id });

            return getUnitName({ unit: { name }, language });
          }),
        ),
      );
    const requiredNames =
      ruleUnit.requires &&
      joinWithOr(
        uniq(
          ruleUnit.requires.map((id) => {
            const name = intl.formatMessage({ id });

            return getUnitName({ unit: { name }, language });
          }),
        ),
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
        !(list.compositionRule.includes("battle-march") && points)) ||
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
      points &&
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
              ruleUnit.requiresOption.unit === general.id.split(".")[0],
          )
          .find((general) =>
            general.options.find(
              (option) =>
                option.id === ruleUnit.requiresOption.id && option.active,
            ),
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
          ruleUnit.requiresIfGeneral.includes(unit.id.split(".")[0]),
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
              (mount) => mount.active && mount.name_en !== "On foot",
            ),
          ),
      );
      const requiredNames = joinWithAnd(
        charactersNotMounted.map((unit) => getUnitName({ unit, language })),
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
          ruleUnit.requiresOption.unit === character.id.split(".")[0],
      );
      const characterWithOption = charactersInList.find((character) =>
        character.options.find(
          (option) => option.id === ruleUnit.requiresOption.id && option.active,
        ),
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
          ruleUnit.requiresCommand.unit === character.id.split(".")[0],
      );
      const characterWithCommand = charactersInList.find((character) =>
        character.command.find(
          (command) =>
            command.id === ruleUnit.requiresCommand.id && command.active,
        ),
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
              (item) =>
                item.name_en.replace(/ /g, "-").toLowerCase() ===
                ruleUnit.requiresMagicItem,
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
      (unit) => ruleUnit.ids && ruleUnit.ids.includes(unit.id.split(".")[0]),
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

  const characterUnitsRules = getUnitRulesByCategory(list.armyComposition, "characters");
  const coreUnitsRules = getUnitRulesByCategory(list.armyComposition, "core");
  const specialUnitsRules = getUnitRulesByCategory(list.armyComposition, "special");
  const rareUnitsRules = getUnitRulesByCategory(list.armyComposition, "rare");
  const alliesUnitsRules = getUnitRulesByCategory(list.armyComposition, "allies");
  const mercenariesUnitsRules = getUnitRulesByCategory(list.armyComposition, "mercenaries");

  characterUnitsRules.forEach((ruleUnit) => {
    checkFor0XRules({ ruleUnit, type: "characters" });
  });

  coreUnitsRules.forEach((ruleUnit) => {
    checkFor0XRules({ ruleUnit, type: "core" });
  });

  specialUnitsRules.forEach((ruleUnit) => {
    checkFor0XRules({ ruleUnit, type: "special" });
  });

  rareUnitsRules.forEach((ruleUnit) => {
    checkFor0XRules({ ruleUnit, type: "rare" });
  });

  alliesUnitsRules.forEach((ruleUnit) => {
    checkFor0XRules({ ruleUnit, type: "allies" });
  });

  mercenariesUnitsRules.forEach((ruleUnit) => {
    checkFor0XRules({ ruleUnit, type: "mercenaries" });
  });

  characterUnitsRules.forEach((ruleUnit) => {
    checkRules({ ruleUnit, type: "characters" });
  });

  coreUnitsRules.forEach((ruleUnit) => {
    checkRules({ ruleUnit, type: "core" });
  });

  specialUnitsRules.forEach((ruleUnit) => {
    checkRules({ ruleUnit, type: "special" });
  });

  rareUnitsRules.forEach((ruleUnit) => {
    checkRules({ ruleUnit, type: "rare" });
  });

  alliesUnitsRules.forEach((ruleUnit) => {
    checkRules({ ruleUnit, type: "allies" });
  });

  mercenariesUnitsRules.forEach((ruleUnit) => {
    checkRules({ ruleUnit, type: "mercenaries" });
  });

  return errors;
};

/**
 * An army must include exactly one general.
 */
const oneGeneral = (list) => {
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
}

/**
 * An army's general must be chosen from the set of characters with the highest
 * leadership in the army, not including characters ineligible to be the 
 * general like Loners.
 */
const generalLeadership = (list) => {
  const errors = [];
  let highestLeadership = 0;
  const generals = getGenerals(list);
  if (list?.characters?.length) {
    list.characters.forEach((unit) => {
      if (
        unit.command &&
        unit.command.find(
          (command) =>
            command.name_en === "General" &&
            (!command.armyComposition ||
              equalsOrIncludes(command.armyComposition, list.armyComposition)),
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
    })
  }
  if (generals.length === 1) {
    const unitLeadership = getUnitLeadership(generals[0].name_en);
    if (unitLeadership && unitLeadership < highestLeadership) {
      errors.push({
        message: "misc.error.generalLeadership",
        section: "characters",
      });
    }
  }
  return errors;
}

/**
 * An army can have at most one Battle Standard Bearer.
 */
const maxOneBSB = (list) => {
  const errors = [];
  const BSBs = !list.characters?.length
    ? []
    : list.characters.filter(
        (unit) =>
          unit.command &&
          unit.command.find(
            (command) =>
              command.active &&
              command.name_en.includes("Battle Standard Bearer"),
          ),
      );
  if (BSBs.length > 1) {
    errors.push({
      message: "misc.error.multipleBSBs",
      section: "characters",
    })
  }
  return errors;
}

/**
 * A Tomb Kings list requires a wizard character to be the army's Hierophant.
 * This Hierophant must be chosen from the highest level wizards in the army.
 * If a Tomb King with The Language of the Priests or Settra is included in the
 * army, they must be the Hierophant.
 */
const hierophantChecks = (list) => {
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
    return [{
      message: "misc.error.noHierophant",
      section: "characters",
    }];
  } else if (hierophants.length > 1) {
    return [{
      message: "misc.error.multipleHierophants",
      section: "characters",
    }];
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
                equalsOrIncludes(command.armyComposition, list.armyComposition)),
          )
        ) {
          const wizardLevel = getWizardLevels(unit).lastIndexOf(1);
          if (wizardLevel && wizardLevel > highestLichePriestLevel) {
            // Settra is always the Hierophant
            highestLichePriestLevel =
              unit.name_en === "Settra the Imperishable" ? 6 : wizardLevel;
          }
        }
      });
    }

    const hierophantLevel =
      (hierophants[0].name_en === "Settra the Imperishable"
        ? 6
        : getWizardLevels(hierophants[0]).lastIndexOf(1));

    if (hierophantLevel < highestLichePriestLevel) {
      return [{
        message: "misc.error.hierophantLevel",
        section: "characters",
      }];
    } else {
      return [];
    }
  }
}

const generalIsWizard = (list) => {
  const errors = [];
  const generals = getGenerals(list) || [];
  if (generals.length === 1) {
    if (getWizardLevels(generals[0]).lastIndexOf(1) < 0) {
      errors.push({
        message: "misc.error.wizardGeneral",
        section: "characters",
      });
    }
  }
  return errors;
}

/**
 * Creates a function that checks whether the army list has a minimum number
 * of non-character units who aren't war machines, swarms, or war beasts.
 */
function makeMinNonCharacters(minNum, notCountedTypes, errorMsg) {
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
      })
      .length;
    
    if (count < minNum) {
      return [{
        message: errorMsg,
        section: "global",
      }];
    } else {
      return [];
    }
  }
}

/**
 * Creates a function that checks an army for if a single unit in the
 * target category exceeds a given point value.
 */
function makeMaxPointsSingleUnit(maxPoints, unitCategory, errorMsg) {
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
  }
}

/**
 * In Grand Melee, an army can only have 1 level 3 wizard per 1000 points,
 * and 1 level 4 wizard per 2000 points.
 */
const grandMeleeWizardLimits = (list) => {
  const errors = [];
  const level3Max = Math.floor(list.points / 1000);
  const level4Max = Math.floor(list.points / 2000);
  let characterWizards = [0, 0, 0, 0, 0];
  let specialWizards = [0, 0, 0, 0, 0];
  let rareWizards = [0, 0, 0, 0, 0];
  let totalWizards = [0, 0, 0, 0, 0];

  list?.characters &&
    list.characters.forEach((unit) => {
      let characterWizard = getWizardLevels(unit);
      characterWizard.forEach((numberAtThisLevel, level) => {
        if (numberAtThisLevel > 0) {
          characterWizards[level] += numberAtThisLevel;
          totalWizards[level] += numberAtThisLevel;
        }
      });
    });
  list?.special &&
    list.special.forEach((unit) => {
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
      let rareWizard = getWizardLevels(unit);
      rareWizard.forEach((numberAtThisLevel, level) => {
        if (numberAtThisLevel > 0) {
          rareWizards[level] += numberAtThisLevel;
          totalWizards[level] += numberAtThisLevel;
        }
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
}

/**
 * Creates a function that checks for duplicate units up to a given number
 * in a target category
 */
function makeLimitUnitRepeats(max, unitCategory, errorMsg) {
  return (list, language) => {
    const errors = [];
    const restrictedUnits = [];

    list[unitCategory] &&
      list[unitCategory].forEach((unit) => {
        const unitRules = getUnitRulesByCategory(list.armyComposition, unitCategory);
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
          (targetUnit) => targetUnit.id.split(".")[0] === unit.id.split(".")[0] || 
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
  }
}
