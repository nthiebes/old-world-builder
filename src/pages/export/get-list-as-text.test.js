/** @typedef {import("../../../types").Unit} Unit */
/** @typedef {import("../../../types").ArmyList} ArmyList */

import { getUnitsString, getListAsText } from "./get-list-as-text";
import en from "../../i18n/en.json";

describe("getUnitsString", () => {
  /** @type {Array<Unit>} */
  const units = [
    {
      name_en: "State troops",
      points: 10,
      strength: 10,
      specialRules: { name_en: "Special Rule 1" },
      command: [
        {
          active: true,
          points: 5,
          name_en: "Champion",
          magic: { selected: [{ points: 10, name_en: "Magic Weapon" }] },
        },
        {
          active: true,
          points: 5,
          name_en: "Standard Bearer",
          magic: { selected: [{ points: 10, name_en: "Magic Banner" }] },
        },
      ],
      equipment: [
        { active: true, points: 1, perModel: true, name_en: "Spears" },
      ],
      armor: [{ active: true, points: 1, perModel: true, name_en: "Shields" }],
      detachments: [{ name_en: "Crossbowmen", points: 5, strength: 5 }],
    },
    {
      name_en: "Character",
      points: 20,
      items: [{ selected: [{ points: 10, name_en: "Magic Item 1" }] }],
      mounts: [{ active: true, points: 10, name_en: "Warhorse" }],
      activeLore: "illusion",
      specialRules: { name_en: "Special Rule 2" },
    },
  ];

  const intl = {
    formatMessage: ({ id }) => en[id],
  };

  const language = "en";

  test("should return the correct string for each unit", () => {
    const expected = `
10 State troops [175 pts]
- Spears
- Shields
- Champion [Magic Weapon]
- Standard Bearer [Magic Banner]
- 5 Crossbowmen
Special Rules: Special Rule 1

Character [40 pts]
- Warhorse
- Magic Item 1
- Illusion
Special Rules: Special Rule 2

`.trimStart();

    const result = getUnitsString({
      units,
      isShowList: false,
      isCompactList: false,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });

  test("should return the correct string for a compact list", () => {
    const expected = `
10 State troops [175 pts]
(Spears, Shields, Champion [Magic Weapon], Standard Bearer [Magic Banner], 5 Crossbowmen)
Special Rules: Special Rule 1

Character [40 pts]
(Warhorse, Magic Item 1, Illusion)
Special Rules: Special Rule 2

`.trimStart();

    const result = getUnitsString({
      units,
      isShowList: false,
      isCompactList: true,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });

  test("should return the correct string for a show list", () => {
    const expected = `
10 State troops
- Spears
- Shields
- Champion
- Standard Bearer
- 5 Crossbowmen
Special Rules: Special Rule 1

Character
- Warhorse
- Illusion
Special Rules: Special Rule 2

`.trimStart();

    const result = getUnitsString({
      units,
      isShowList: true,
      isCompactList: false,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
    expect(result).not.toContain("pts");
    expect(result).not.toContain("Magic");
  });

  test("should return the correct string without special rules", () => {
    const expected = `
10 State troops [175 pts]
- Spears
- Shields
- Champion [Magic Weapon]
- Standard Bearer [Magic Banner]
- 5 Crossbowmen

Character [40 pts]
- Warhorse
- Magic Item 1
- Illusion

`.trimStart();

    const result = getUnitsString({
      units,
      isShowList: false,
      isCompactList: false,
      showSpecialRules: false,
      intl,
      language,
    });

    expect(result).toBe(expected);
    expect(result).not.toContain("Special Rules");
  });
});

describe("getListAsMarkdown", () => {
  const intl = {
    formatMessage: ({ id }) => en[id],
  };

  const language = "en";

  test("should return the correct string for each category", () => {
    // We only test the global army list rendering.
    // All special cases for units themselves are covered above.
    // So that's why the units are minimal here.

    /** @type {ArmyList} */
    const list = {
      name: "My Army List",
      game: "the-old-world",
      army: "empire-of-man",
      armyComposition: "standard",
      characters: [{ name_en: "General", points: 100 }],
      core: [
        { name_en: "State troops", strength: 20, points: 10 },
        { name_en: "Missile troops", strength: 10, points: 10 },
      ],
      special: [{ name_en: "Knights", strength: 10, points: 20 }],
      rare: [{ name_en: "Monster", points: 100 }],
    };

    const expected = `
===
My Army List [700 pts]
Warhammer: The Old World, Empire of Man
===

++ Characters [100 pts] ++

General [100 pts]

++ Core Units [300 pts] ++

20 State troops [200 pts]

10 Missile troops [100 pts]

++ Special Units [200 pts] ++

10 Knights [200 pts]

++ Rare Units [100 pts] ++

Monster [100 pts]

---
Created with "Old World Builder"

[https://old-world-builder.com]`.trimStart();

    const result = getListAsText({
      list,
      isShowList: false,
      isCompactList: false,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });
});
