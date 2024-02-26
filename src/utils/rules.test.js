import { getMaxPercent, getMinPercent } from "./rules";

describe("getMaxPercent", () => {
  test("should return 0.25 for rare for grand-army", () => {
    expect(getMaxPercent("rare", "grand-army")).toBe(0.25);
  });

  test("should return 0.33 for core for errantry-crusades", () => {
    expect(getMaxPercent("rare", "errantry-crusades")).toBe(0.33);
  });

  test("should return the default 'grand-army' value if not specified", () => {
    expect(getMaxPercent("rare")).toBe(0.25);
  });

  test("should return the default 'grand-army' value value if the specified army composition does not exist", () => {
    expect(getMaxPercent("rare", "unknown-army")).toBe(0.25);
  });
});

describe("getMinPercent", () => {
  test("should return 0.25 for core for grand-army", () => {
    expect(getMinPercent("core", "grand-army")).toBe(0.25);
  });

  test("should return 0.33 for core for errantry-crusades", () => {
    expect(getMinPercent("core", "errantry-crusades")).toBe(0.33);
  });

  test("should return the default grand-army value if not specified", () => {
    expect(getMinPercent("core")).toBe(0.25);
  });

  test("should return the default grand-army value value if the specified army composition does not exist", () => {
    expect(getMinPercent("core", "unknown-army")).toBe(0.25);
  });
});
