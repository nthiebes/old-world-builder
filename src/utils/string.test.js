import { normalizeRuleName, equalsOrIncludes } from "./string";

describe("normalizeRuleName", () => {
  test("Lower cases rules names", () => {
    expect(normalizeRuleName("Settra the Imperishable")).toBe("settra the imperishable");
  });

  test("Removes everything between parenthesis", () => {
    expect(normalizeRuleName("Hatred (Anything + Everything)")).toBe("hatred");
  });

  test("Converts curly quotes to straight quotes", () => {
    expect(normalizeRuleName("“Stand Back Chief”")).toBe("\"stand back chief\"");
  });

  test("Removes asterisks (*)", () => {
    expect(normalizeRuleName("Sword of Striking*")).toBe("sword of striking");
  });

  test("Removes curly braces", () => {
    expect(normalizeRuleName("Skeletal Steed {Tomb Kings}")).toBe("skeletal steed tomb kings");
  });
});

describe("equalsOrIncludes", () => {
    test("Returns true if object and target are equal", () => {
      expect(equalsOrIncludes("tomb-kings", "tomb-kings")).toBe(true);
    });

    test("Returns false if object is string and target is just a subset of that string", () => {
      expect(equalsOrIncludes("tomb-kings", "kings")).toBe(false);
    });

    test("Returns true if object is array and target included in it", () => {
      expect(equalsOrIncludes(["tomb-kings", "mortuary-cults"], "mortuary-cults")).toBe(true);
    });
    
    test("Returns false if object is array and target isn't in it", () => {
        expect(equalsOrIncludes(["tomb-kings", "mortuary-cults"], "kings")).toBe(false);
      });
  });
