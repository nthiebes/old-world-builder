/** @typedef {import("../../../types").Unit} Unit */

import { unitAsMarkdown, armyListAsMarkdown } from "./get-list-as-markdown";
import en from "../../i18n/en.json";

describe("getUnitString", () => {
  /** @type {Array<Unit>} */
  const stateTroops = {
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
    equipment: [{ active: true, points: 1, perModel: true, name_en: "Spears" }],
    armor: [{ active: true, points: 1, perModel: true, name_en: "Shields" }],
    detachments: [{ name_en: "Crossbowmen", points: 5, strength: 5 }],
  };

  const character = {
    name_en: "Character",
    points: 20,
    items: [{ selected: [{ points: 10, name_en: "Magic Item 1" }] }],
    mounts: [{ active: true, points: 10, name_en: "Warhorse" }],
    activeLore: "illusion",
    specialRules: { name_en: "Special Rule 2" },
  };

  const intl = {
    formatMessage: ({ id }) => en[id],
  };

  const language = "en";

  test("should display a character with options", () => {
    const expected = `
### Character [40 pts]

- Warhorse
- Magic Item 1
- Illusion

**Special Rules:** Special Rule 2`.trimStart();

    expect(
      unitAsMarkdown({
        unit: character,
        isShowList: false,
        isCompactList: false,
        showSpecialRules: true,
        intl,
        language,
      })
    ).toBe(expected);
  });

  test("should display a unit with options", () => {
    const expected = `
### 10 State troops [175 pts]

- Spears
- Shields
- Champion [Magic Weapon]
- Standard Bearer [Magic Banner]
- 5 Crossbowmen

**Special Rules:** Special Rule 1`.trimStart();

    const result = unitAsMarkdown({
      unit: stateTroops,
      isShowList: false,
      isCompactList: false,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });

  test("should have all options on a single line for compact lists", () => {
    const expected = `
### 10 State troops [175 pts]

Spears, Shields, Champion [Magic Weapon], Standard Bearer [Magic Banner], 5 Crossbowmen

**Special Rules:** Special Rule 1`.trimStart();

    const result = unitAsMarkdown({
      unit: stateTroops,
      isShowList: false,
      isCompactList: true,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });

  test("should hide points and magic items for a show list", () => {
    const expected = `
### Character

- Warhorse
- Illusion

**Special Rules:** Special Rule 2`.trimStart();

    const result = unitAsMarkdown({
      unit: character,
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

  test("should hide special rules if flag is disabled", () => {
    const expected = `
### 10 State troops [175 pts]

- Spears
- Shields
- Champion [Magic Weapon]
- Standard Bearer [Magic Banner]
- 5 Crossbowmen`.trimStart();

    const result = unitAsMarkdown({
      unit: stateTroops,
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

  test("should display all categories for Warhammer Old World correctly", () => {
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
      allies: [{ name_en: "Ally", points: 100 }],
      mercenaries: [{ name_en: "Mercenary", points: 100 }],
    };

    const expected = `
# My Army List [900 pts]

Warhammer: The Old World, Empire of Man

## Characters [100 pts]

### General [100 pts]

## Core Units [300 pts]

### 20 State troops [200 pts]

### 10 Missile troops [100 pts]

## Special Units [200 pts]

### 10 Knights [200 pts]

## Rare Units [100 pts]

### Monster [100 pts]

## Mercenaries [100 pts]

### Mercenary [100 pts]

## Allies [100 pts]

### Ally [100 pts]

---

Created with [Old World Builder](https://old-world-builder.com)`.trimStart();

    const result = armyListAsMarkdown({
      list,
      isShowList: false,
      isCompactList: false,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });

  test("should display all categories for Warhammer Fantasy correctly", () => {
    // We only test the global army list rendering.
    // All special cases for units themselves are covered above.
    // So that's why the units are minimal here.

    /** @type {ArmyList} */
    const list = {
      name: "My Army List",
      game: "warhammer-fantasy",
      army: "greenskins",
      armyComposition: "standard",
      lords: [{ name_en: "Lord", points: 100 }],
      heroes: [{ name_en: "Hero", points: 100 }],
      core: [
        { name_en: "State troops", strength: 20, points: 10 },
        { name_en: "Missile troops", strength: 10, points: 10 },
      ],
      special: [{ name_en: "Knights", strength: 10, points: 20 }],
      rare: [{ name_en: "Monster", points: 100 }],
    };

    const expected = `
# My Army List [800 pts]

Warhammer Fantasy, Orcs & Goblins

## Lords [100 pts]

### Lord [100 pts]

## Heroes [100 pts]

### Hero [100 pts]

## Core Units [300 pts]

### 20 State troops [200 pts]

### 10 Missile troops [100 pts]

## Special Units [200 pts]

### 10 Knights [200 pts]

## Rare Units [100 pts]

### Monster [100 pts]

---

Created with [Old World Builder](https://old-world-builder.com)`.trimStart();

    const result = armyListAsMarkdown({
      list,
      isShowList: false,
      isCompactList: false,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });

  test("should not display the army list header if compact list is enabled", () => {
    const list = {
      name: "My Army List",
      game: "the-old-world",
      army: "empire-of-man",
      armyComposition: "standard",
      characters: [{ name_en: "General", points: 100 }],
    };

    const expected = `
## Characters [100 pts]

### General [100 pts]

---

Created with [Old World Builder](https://old-world-builder.com)`.trimStart();

    const result = armyListAsMarkdown({
      list,
      isShowList: false,
      isCompactList: true,
      showSpecialRules: true,
      intl,
      language,
    });

    expect(result).toBe(expected);
  });
});
