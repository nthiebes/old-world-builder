/** @typedef {import('../../types').Unit} Unit */
import {
  sumAmountPoints,
  sumUnitPoints,
  sumCategoryPoints,
  sumArmyListPoints,
} from "./points";

describe("sumSelectedPoints", () => {
  test("should return 0 for an empty selected array", () => {
    const selected = [];
    expect(sumAmountPoints(selected)).toBe(0);
  });

  test("should return the sum of points multiplied by amount for each option in the selected array", () => {
    const selected = [
      { amount: 2, points: 5 },
      { amount: 3, points: 10 },
      { amount: 1, points: 3 },
    ];
    expect(sumAmountPoints(selected)).toBe(43);
  });

  test("should return the sum of points multiplied by 1 for each option in the selected array if amount is not provided", () => {
    const selected = [{ points: 5 }, { points: 10 }, { points: 3 }];
    expect(sumAmountPoints(selected)).toBe(18);
  });

  test("should ignore undefined items", () => {
    expect(sumAmountPoints([undefined])).toBe(0);
    expect(sumAmountPoints(undefined)).toBe(0);
  });
});

describe("sumUnitPoints", () => {
  test("should sum basic points for a simple unit with no options", () => {
    const unit = { points: 10 };
    expect(sumUnitPoints(unit)).toBe(10);
  });

  test("should multiply basic points with the unit strength", () => {
    const unit = { points: 10, strength: 10 };
    expect(sumUnitPoints(unit)).toBe(100);
  });

  test("should return the sum for a character with options, equipment, armor, a mount, and magic items", () => {
    const unit = {
      type: "character",
      // 10
      points: 10,
      // 20
      options: [
        { active: true, points: 10 },
        { active: true, points: 10 },
      ],
      // 10
      equipment: [{ active: true, points: 10 }],
      // 10
      armor: [{ active: true, points: 10 }],
      // 10
      mounts: [{ active: true, points: 10 }],
      // 40
      items: [
        {
          selected: [
            // selected items do not need the active flag
            { amount: 1, points: 20 },
            { amount: 2, points: 10 },
          ],
        },
      ],
    };
    expect(sumUnitPoints(unit)).toBe(100);
  });

  test("should return the sum for a unit with strength 10, equipment, options, armor, a command, and 2 detachments", () => {
    /** @type {Unit} */
    const unit = {
      type: "infantry",
      // 100
      points: 10,
      strength: 10,
      // 10
      equipment: [{ active: true, points: 1, perModel: true }],
      // 10
      armor: [{ active: true, points: 1, perModel: true }],
      // 30
      options: [
        { active: true, points: 1, perModel: true },
        { active: true, points: 5, stackable: true, stackableCount: 2 },
        { active: true, points: 5, stackable: true, minimum: 2 },
      ],
      // 50
      command: [
        { active: true, points: 10 },
        { active: true, points: 10, options: [{ active: true, points: 10 }] },
        {
          active: true,
          points: 10,
          magic: {
            // selected items do not need the active flag
            selected: [{ points: 10 }, { amount: 2, points: 10 }],
          },
        },
      ],
      detachments: [
        // 25
        { points: 5, strength: 5 },
        // 35
        {
          points: 5,
          strength: 5,
          options: [{ active: true, points: 1, perModel: true }],
          armor: [{ active: true, points: 1, perModel: true }],
        },
      ],
    };
    expect(sumUnitPoints(unit)).toBe(280);
  });

  test("should ignore inactive options", () => {
    /** @type {Unit} */
    const unit = {
      points: 10,
      // all inactive:
      options: [{ points: 10 }],
      command: [
        {
          points: 10,
          magic: { selected: [{ points: 10 }] },
          options: [{ points: 10 }],
        },
      ],
      armor: [{ points: 10 }],
      equipment: [{ points: 10 }],
      mounts: [{ points: 10 }],
    };
    expect(sumUnitPoints(unit)).toBe(10);
  });

  test("should not count command points if the unit is a detachment", () => {
    /** @type {Unit} */
    const unit = {
      type: "detachment",
      points: 10,
      options: [{ active: true, name_en: "Detachment", points: 0 }],
      command: [
        { active: true, points: 10 },
        {
          active: true,
          points: 10,
          magic: { selected: [{ points: 10 }] },
          options: [{ active: true, points: 10 }],
        },
      ],
    };
    expect(sumUnitPoints(unit)).toBe(10);
  });
});

describe("sumCategoryPoints", () => {
  test("should return the sum of points for a given category in the army list", () => {
    const category = "units";
    const armyList = {
      units: [{ points: 10 }, { points: 20 }, { points: 30 }],
      heroes: [{ points: 15 }, { points: 25 }],
    };
    expect(sumCategoryPoints(armyList, category)).toBe(60);
  });

  test("should return 0 if the category does not exist in the army list", () => {
    const category = "spells";
    const armyList = {
      units: [{ points: 10 }, { points: 20 }, { points: 30 }],
      heroes: [{ points: 15 }, { points: 25 }],
    };
    expect(sumCategoryPoints(armyList, category)).toBe(0);
  });

  test("should return 0 if the category is empty in the army list", () => {
    const category = "units";
    const armyList = {
      units: [],
      heroes: [{ points: 15 }, { points: 25 }],
    };
    expect(sumCategoryPoints(armyList, category)).toBe(0);
  });

  test("should return 0 if the army list is empty", () => {
    const category = "units";
    const armyList = {};
    expect(sumCategoryPoints(armyList, category)).toBe(0);
  });
});

describe("sumArmyListPoints", () => {
  test("should return the sum of points for a fantasy army list", () => {
    const armyList = {
      lords: [{ points: 10 }, { points: 10 }],
      heroes: [{ points: 10 }, { points: 10 }],
      core: [{ points: 10 }, { points: 10 }],
      special: [{ points: 10 }, { points: 10 }],
      rare: [{ points: 10 }, { points: 10 }],
    };
    expect(sumArmyListPoints(armyList)).toBe(100);
  });

  test("should return the sum of points an old world army list", () => {
    const armyList = {
      characters: [{ points: 10 }, { points: 10 }],
      core: [{ points: 10 }, { points: 10 }],
      special: [{ points: 10 }, { points: 10 }],
      rare: [{ points: 10 }, { points: 10 }],
      mercenaries: [{ points: 10 }, { points: 10 }],
      allies: [{ points: 10 }, { points: 10 }],
    };
    expect(sumArmyListPoints(armyList)).toBe(120);
  });

  test("should return 0 if the army list is empty", () => {
    const armyList = {};
    expect(sumArmyListPoints(armyList)).toBe(0);
  });

  test("should return 0 if all categories in the army list are empty", () => {
    const armyList = {
      lords: [],
      heroes: [],
      core: [],
      special: [],
      rare: [],
      characters: [],
      mercenaries: [],
      allies: [],
    };
    expect(sumArmyListPoints(armyList)).toBe(0);
  });
});
