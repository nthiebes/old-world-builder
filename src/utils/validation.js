import { rules } from "./rules";
import { uniq } from "./collection";

export const validateList = ({ list, language, characters }) => {
  const errors = [];
  const generalsCount = list.characters.filter(
    (unit) =>
      unit.command &&
      unit.command.find((command) => command.active && command.id === 0)
  ).length;
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
    ? rules[list.armyComposition].allies.units
    : rules["grand-army"].allies.units;
  const mercenariesUnitsRules = rules[list.armyComposition]
    ? rules[list.armyComposition].mercenaries.units
    : rules["grand-army"].mercenaries.units;

  const checkRules = ({ ruleUnit, type }) => {
    const unitsInList = list[type].filter(
      (unit) => ruleUnit.ids && ruleUnit.ids.includes(unit.id.split(".")[0])
    );
    const requiredCharactersInList = list.characters.filter(
      (core) =>
        ruleUnit.requires && ruleUnit.requires.includes(core.id.split(".")[0])
    );
    const namesInList = uniq(
      unitsInList.map((unit) => unit[`name_${language}`] || unit.name_en)
    )
      .join(", ")
      .replace(/, ([^,]*)$/, " or $1");
    const requiredNames =
      ruleUnit.requires &&
      uniq(
        ruleUnit.requires.map((id) => {
          const unit = characters.find((unit) => unit.id === id);

          return unit[`name_${language}`] || unit.name_en;
        })
      )
        .join(", ")
        .replace(/, ([^,]*)$/, " or $1");
    const points = ruleUnit.points;
    const min = points ? ruleUnit.min : ruleUnit.min;
    const max = points
      ? Math.floor(list.points / points) * ruleUnit.max
      : ruleUnit.max;

    // Not enough units
    if (points && unitsInList.length < min) {
      errors.push({
        message: "misc.error.minUnits",
        section: type,
        name: namesInList,
        min,
      });
    }

    // Too many units
    if (points && unitsInList.length > max) {
      errors.push({
        message: "misc.error.maxUnits",
        section: type,
        name: namesInList,
        diff: unitsInList.length - max,
      });
    }

    // Requires general
    if (ruleUnit.requiresGeneral && generalsCount === 0) {
      errors.push({
        message: "misc.error.requiresGeneral",
        section: type,
        name: requiredNames,
      });
    }

    // Requires characters
    if (
      ruleUnit.requires &&
      unitsInList.length > requiredCharactersInList.length
    ) {
      if (ruleUnit.requiresGeneral && unitsInList.length > max) {
        errors.push({
          message: "misc.error.maxUnits",
          section: type,
          name: namesInList,
          diff: unitsInList.length - max,
        });
      } else {
        errors.push({
          message: "misc.error.requiresUnits",
          section: type,
          name: requiredNames && requiredNames,
          diff: unitsInList.length - requiredCharactersInList.length,
        });
      }
    }
  };

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

  characterUnitsRules.forEach((ruleUnit) => {
    checkRules({ ruleUnit, type: "characters" });
  });

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
