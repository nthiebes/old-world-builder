import { describe, expect, test } from "vitest";
import { getPointsPerModel, getUnitBasePoints, getUnitPoints } from "./points";

describe("composition-specific unit points", () => {
  const unit = {
    points: 10,
    minimum: 5,
    armyComposition: {
      "de-renegade": {
        points: 12,
      },
    },
  };

  test("returns the army-composition points when present", () => {
    expect(getUnitBasePoints(unit, "de-renegade")).toBe(12);
    expect(getPointsPerModel(unit, "de-renegade")).toBe(12);
    expect(getUnitPoints(unit, { armyComposition: "de-renegade" })).toBe(60);
  });

  test("falls back to the unit points", () => {
    expect(getUnitBasePoints(unit, "dark-elves")).toBe(10);
    expect(getPointsPerModel(unit, "dark-elves")).toBe(10);
    expect(getUnitPoints(unit, { armyComposition: "dark-elves" })).toBe(50);
  });

  test("uses the composition minimum for an unselected unit", () => {
    const minimumOverrideUnit = {
      ...unit,
      minimum: 10,
      armyComposition: { "de-renegade": { points: 12, minimum: 5 } },
    };

    expect(
      getUnitPoints(minimumOverrideUnit, { armyComposition: "de-renegade" }),
    ).toBe(60);
    expect(
      getUnitPoints(minimumOverrideUnit, { armyComposition: "dark-elves" }),
    ).toBe(100);
    expect(
      getUnitPoints(
        { ...minimumOverrideUnit, strength: 8 },
        { armyComposition: "de-renegade" },
      ),
    ).toBe(96);
  });
});
