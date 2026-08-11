import { describe, expect, test } from "vitest";
import { getUnitStrength } from "./unit";

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
