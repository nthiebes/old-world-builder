import { getGenerals } from "./army";
import { uniq } from "./collection";
import { getUnitRulesByCategory } from "./rules";
import { getUnitName } from "./unit";
import { joinWithAnd, joinWithOr } from "./string";
import {
  createLimitUnitRepeats,
  createMaxPointsSingleUnit,
  createMinNonCharacters,
  generalIsHierophant,
  generalIsWizard,
  grandMeleeMaxModelsSingleUnit,
  generalLeadership,
  grandMeleeWizardLimits,
  hierophantChecks,
  maxOneBSB,
  oneGeneral,
} from "./validation-checks";

export const validateList = ({ list, language, intl }) => {
  let errors = [];

  let checks = [oneGeneral, generalLeadership, maxOneBSB];
  if (list.compositionRule && list.compositionRule.includes("grand-melee")) {
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "characters",
        "misc.error.grandMelee25",
        true,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "core",
        "misc.error.grandMelee25",
        true,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "special",
        "misc.error.grandMelee25",
        true,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "rare",
        "misc.error.grandMelee25",
        true,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "mercenaries",
        "misc.error.grandMelee25",
        true,
      ),
    );
    checks.push(grandMeleeWizardLimits);
    checks.push(grandMeleeMaxModelsSingleUnit);
  }
  if (list.compositionRule && list.compositionRule.includes("combined-arms")) {
    const additionalUnits = Math.max(
      Math.floor((list.points - 2000) / 1000),
      0,
    );
    checks.push(
      createLimitUnitRepeats(
        3 + additionalUnits,
        "characters",
        "misc.error.maxUnits",
      ),
    );
    checks.push(
      createLimitUnitRepeats(
        4 + additionalUnits,
        "core",
        "misc.error.maxUnits",
      ),
    );
    checks.push(
      createLimitUnitRepeats(
        3 + additionalUnits,
        "special",
        "misc.error.maxUnits",
      ),
    );
    checks.push(
      createLimitUnitRepeats(
        2 + additionalUnits,
        "rare",
        "misc.error.maxUnits",
      ),
    );
    checks.push(
      createLimitUnitRepeats(
        2 + additionalUnits,
        "mercenaries",
        "misc.error.maxUnits",
      ),
    );
  }
  if (list.compositionRule && list.compositionRule.includes("battle-march")) {
    checks.push(
      createMinNonCharacters(
        2,
        ["WB", "Sw"],
        "misc.error.notEnoughNonCharactersBattleMarch",
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "characters",
        "misc.error.battleMarch25PercentPerCharacter",
        false,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.35 * list.points,
        "core",
        "misc.error.battleMarch35PercentPerCore",
        false,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.3 * list.points,
        "special",
        "misc.error.battleMarch30PercentPerSpecial",
        false,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "rare",
        "misc.error.battleMarch25PercentPerRare",
        false,
      ),
    );
    checks.push(
      createMaxPointsSingleUnit(
        0.25 * list.points,
        "mercenaries",
        "misc.error.battleMarch25PercentPerMercenary",
        false,
      ),
    );
  } else {
    checks.push(
      createMinNonCharacters(
        3,
        ["WM", "WB", "Sw"],
        "misc.error.notEnoughNonCharacters",
      ),
    );
  }
  if (list?.army === "tomb-kings-of-khemri") {
    checks.push(hierophantChecks);
    if (list.armyComposition === "mortuary-cults") {
      checks.push(generalIsHierophant);
    }
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

  const characterUnitsRules = getUnitRulesByCategory(
    list.armyComposition,
    "characters",
  );
  const coreUnitsRules = getUnitRulesByCategory(list.armyComposition, "core");
  const specialUnitsRules = getUnitRulesByCategory(
    list.armyComposition,
    "special",
  );
  const rareUnitsRules = getUnitRulesByCategory(list.armyComposition, "rare");
  const alliesUnitsRules = getUnitRulesByCategory(
    list.armyComposition,
    "allies",
  );
  const mercenariesUnitsRules = getUnitRulesByCategory(
    list.armyComposition,
    "mercenaries",
  );

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
