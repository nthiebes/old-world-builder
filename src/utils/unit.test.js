import { describe, expect, test } from "vitest";
import {
  getUnitLoresWithSpells,
  getUnitMinimum,
  getUnitStrength,
  getUnitTroopType,
} from "./unit";

describe("getUnitMinimum", () => {
  const unit = {
    minimum: 10,
    armyComposition: {
      "de-renegade": {
        minimum: 5,
      },
    },
  };

  test("Returns the army-composition minimum when present", () => {
    expect(getUnitMinimum(unit, "de-renegade")).toBe(5);
  });

  test("Falls back to the unit minimum", () => {
    expect(getUnitMinimum(unit, "dark-elves")).toBe(10);
  });
});

describe("getUnitTroopType", () => {
  const unit = {
    name_en: "State Troops",
    armyComposition: {
      "test-renegade": {
        troopType: "HI",
      },
    },
  };

  test("Returns the army-composition troop type when present", () => {
    expect(getUnitTroopType(unit, "test-renegade")).toBe("HI");
  });

  test("Falls back to the rules-index troop type", () => {
    expect(getUnitTroopType(unit, "empire-of-man")).toBe("RI");
  });
});

describe("getUnitLoresWithSpells", () => {
  const sorceress = {
    id: "sorceress",
    options: [],
    specialRules: {
      name_en: "Lore of Naggaroth {renegade}",
    },
  };

  test("Includes Power of Darkness for Dark Elf Renegades", () => {
    const lores = getUnitLoresWithSpells(sorceress, "de-renegade");

    expect(lores["lore-of-naggaroth"]["power of darkness"]).toEqual({
      index: "signature",
    });
  });

  test("Does not include Power of Darkness for normal Dark Elves", () => {
    const lores = getUnitLoresWithSpells(sorceress, "dark-elves");

    expect(lores["lore-of-naggaroth"]["power of darkness"]).toBeUndefined();
  });
});

describe("getUnitStrength", () => {
  test("Returns correct unit strength of regular infantry", () => {
    const unitStr = getUnitStrength({
      name_en: "State Troops",
      strength: 10
    });
    expect(unitStr).toBe(10);
  });

  test("Treats unknown units as unit strength 1 per model", () => {
    const unitStr = getUnitStrength({
      name_en: "Made Up Unit",
      strength: 10
    });
    expect(unitStr).toBe(10);
  });

  test("Uses initial wounds for behemoths", () => {
    const unitStr = getUnitStrength({
      name_en: "Giant",
    });
    expect(unitStr).toBe(6);
  });

  test("Uses initial wounds for war machines with multiple stat lines", () => {
    const unitStr = getUnitStrength({
      name_en: "Great Cannon {empire}",
    });
    expect(unitStr).toBe(3);
  });

  test("When a character is mounted, use the mount's model type", () => {
    const unitStr = getUnitStrength({
      name_en: "General of the Empire",
      mounts: [
        {
          name_en: "On foot",
          active: false,
        },
        {
          name_en: "Barded Warhorse",
          active: true,
        }
      ],
    });
    expect(unitStr).toBe(2);
  });

  test("When a character is mounted on a monster, add the model's wounds together", () => {
    const unitStr = getUnitStrength({
      name_en: "General of the Empire",
      mounts: [
        {
          name_en: "On foot",
          active: false,
        },
        {
          name_en: "Griffon {empire}",
          active: true,
        }
      ],
    });
    expect(unitStr).toBe(6);
  });

  test("Includes detachment strength when parameter is true", () => {
    const unitStr = getUnitStrength({
      name_en: "Nuln State Troops",
      strength: 20,
      detachments: [
        {
          name_en: "State Troops",
          strength: 5
        },
        {
          name_en: "State Missile Troops",
          strength: 5
        },
      ],
    }, true, false);
    expect(unitStr).toBe(30);
  });
  
  test("Can get correct strength for detachment only units", () => {
    const unitStr = getUnitStrength({
      name_en: "Primal Warherd",
      detachmentsInUnitStr: true,
      detachments: [
        {
          name_en: "Gors",
          strength: 10
        },
        {
          name_en: "Ungors",
          strength: 12
        },
      ],
    }, true);
    expect(unitStr).toBe(22);
  });
});
