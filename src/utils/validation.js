import { rules } from "./rules";
import { uniq } from "./collection";
import { getUnitName } from "./unit";

export const validateList = ({ list, language, intl }) => {
  const errors = [];
  const generals = !list?.characters.length
    ? []
    : list.characters.filter(
        (unit) =>
          unit.command &&
          unit.command.find(
            (command) => command.active && command.name_en === "General"
          )
      );
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
  const generalsCount = generals.length;
  const BSBsCount = BSBs.length;
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

  const checkRules = ({ ruleUnit, type }) => {
    const unitsInList = list[type].filter(
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
    const namesInList = uniq(
      unitsInList.map((unit) => getUnitName({ unit, language }))
    )
      .join(", ")
      .replace(/, ([^,]*)$/, " or $1");
    const unitNames =
      ruleUnit.min > 0 &&
      uniq(
        ruleUnit.ids.map((id) => {
          const name = intl.formatMessage({ id });

          return getUnitName({ unit: { name }, language });
        })
      )
        .join(", ")
        .replace(/, ([^,]*)$/, " or $1");
    const requiredNames =
      ruleUnit.requires &&
      uniq(
        ruleUnit.requires.map((id) => {
          const name = intl.formatMessage({ id });

          return getUnitName({ unit: { name }, language });
        })
      )
        .join(", ")
        .replace(/, ([^,]*)$/, " or $1");
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
      unitsInList.length > max
    ) {
      errors.push({
        message: "misc.error.maxUnits",
        section: type,
        name: namesInList,
        diff: unitsInList.length - max,
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
      const requiredNames = charactersNotMounted
        .map((unit) => getUnitName({ unit, language }))
        .join(", ")
        .replace(/, ([^,]*)$/, " and $1");

      charactersNotMounted.length &&
        errors.push({
          message: "misc.error.requiresMounted",
          section: type,
          name: requiredNames,
        });
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
        unitsInList.length > requiredUnitsInList.length
      ) {
        errors.push({
          message: "misc.error.requiresUnits",
          section: type,
          name: requiredNames,
          diff: unitsInList.length - requiredUnitsInList.length,
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

  // Multiple BSBs
  BSBsCount > 1 &&
    errors.push({
      message: "misc.error.multipleBSBs",
      section: "characters",
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
