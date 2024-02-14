/** @typedef {import('../../types').ArmyComposition} ArmyComposition */
/** @typedef {import('../../types').Category} Category */

export const rules = {
  "grand-army": {
    lords: { maxPercent: 25 },
    heroes: { maxPercent: 25 },
    characters: { maxPercent: 50 },
    core: { minPercent: 25 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 25,
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "kingdom-of-bretonnia": {
    characters: {
      maxPercent: 50,
      units: [
        {
          id: "duke",
          min: 0,
          max: 1,
        },
        {
          id: "baron",
          min: 0,
          max: 1,
          perPoints: 1000,
        },
        {
          id: "prophetees",
          min: 0,
          max: 1,
          perPoints: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["knights-of-the-realm", "mounted-knights-of-the-realm"],
          min: 1,
        },
        {
          ids: ["men-at-arms", "peasant-bowmen"],
          min: 1,
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          id: "battle-pilgrims",
          min: 0,
          max: 2,
          perPoints: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          id: "field-trebuchet",
          min: 0,
          max: 1,
          perPoints: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: {
      maxPercent: 25,
      armies: [
        "errantry-crusades",
        "bretonnian-exiles",
        "dwarfen-mountain-holds",
        "empire-of-man",
        "high-elf-realms",
        "wood-elf-realms",
      ],
    },
  },
  "errantry-crusades": {
    characters: { maxPercent: 50 },
    core: { minPercent: 33 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 33,
    },
    mercenaries: {
      maxPercent: 25,
      armies: ["empire-of-man"],
      units: "Empire Knights & Empire Inner Circle Knights ...",
    },
  },
  "bretonnian-exiles": {
    characters: { maxPercent: 50 },
    core: { minPercent: 25 },
    special: {
      maxPercent: 33,
    },
    rare: {
      maxPercent: 33,
    },
    mercenaries: {
      maxPercent: 25,
      armies: ["empire-of-man"],
      units: "Free Company Militia & Empire Archers ...",
    },
  },
  "tomb-kings-of-khemri": {
    characters: { maxPercent: 50 },
    core: { minPercent: 25 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 25,
    },
    mercenaries: {
      maxPercent: 20,
    },
    allies: {
      maxPercent: 25,
    },
  },
  "nehekharan-royal-hosts": {
    characters: { maxPercent: 50 },
    core: { minPercent: 33 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 25,
    },
  },
  "mortuary-cults": {
    characters: { maxPercent: 50 },
    core: { minPercent: 33 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 33,
    },
  },
};

/**
 * Get the max percent for a given type and army composition
 *
 * @param {Category} category
 * @param {ArmyComposition} armyComposition
 * @returns
 */
export const getMaxPercent = (category, armyComposition) =>
  (rules[armyComposition]?.[category].maxPercent ??
    rules["grand-army"][category].maxPercent) / 100;

/**
 * Get the min percent for a given type and army composition
 *
 * @param {Category} category
 * @param {ArmyComposition} armyComposition
 * @returns
 */
export const getMinPercent = (category, armyComposition) =>
  (rules[armyComposition]?.[category].minPercent ??
    rules["grand-army"][category].minPercent) / 100;
