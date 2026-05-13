import { describe, test, expect } from "vitest";
import { generateRank } from "./lexorank";

describe("generateRank", () => {
  describe("basic cases", () => {
    test("returns midpoint between boundaries when no neighbors exist", () => {
      // First item gets midpoint between "000000" and "zzzzzz"
      const first = generateRank(null, null);
      expect(first > "000000").toBe(true);
      expect(first < "zzzzzz").toBe(true);
    });

    test("finds midpoint before next when prev is null", () => {
      const beforeN = generateRank(null, "n");
      expect(beforeN < "n").toBe(true);
      expect(beforeN > "000000").toBe(true);
      // Works even for 'a' - should produce something that sorts before 'a'
      expect(generateRank(null, "a") < "a").toBe(true);
    });

    test("finds midpoint after prev when next is null", () => {
      const afterN = generateRank("n", null);
      expect(afterN > "n").toBe(true);
      expect(afterN < "zzzzzz").toBe(true);
    });
  });

  describe("midpoint calculation", () => {
    test("finds midpoint between two single characters", () => {
      const result = generateRank("a", "z");
      expect(result > "a").toBe(true);
      expect(result < "z").toBe(true);
    });

    test("finds midpoint between adjacent characters by extending", () => {
      // Between 'a' and 'b', need to extend since no char between them
      const result = generateRank("a", "b");
      expect(result > "a").toBe(true);
      expect(result < "b").toBe(true);
    });

    test("finds midpoint between multi-character strings", () => {
      const result = generateRank("abc", "xyz");
      expect(result > "abc").toBe(true);
      expect(result < "xyz").toBe(true);
    });

    test("handles strings with shared prefix", () => {
      const result = generateRank("na", "nz");
      expect(result > "na").toBe(true);
      expect(result < "nz").toBe(true);
    });
  });

  describe("ordering property - results always sort correctly", () => {
    test("sequential insertions at end maintain order", () => {
      let ranks = [];
      let lastRank = null;

      // Simulate adding 10 items to the end
      for (let i = 0; i < 10; i++) {
        const newRank = generateRank(lastRank, null);
        ranks.push(newRank);
        lastRank = newRank;
      }

      // Verify all ranks sort in order
      const sorted = [...ranks].sort();
      expect(sorted).toEqual(ranks);
    });

    test("sequential insertions at beginning maintain order", () => {
      let ranks = [];
      let firstRank = null;

      // Simulate adding 10 items to the beginning
      for (let i = 0; i < 10; i++) {
        const newRank = generateRank(null, firstRank);
        ranks.unshift(newRank);
        firstRank = newRank;
      }

      // Verify all ranks sort in order
      const sorted = [...ranks].sort();
      expect(sorted).toEqual(ranks);
    });

    test("insertions between items maintain order", () => {
      // Start with two items
      const first = generateRank(null, null);
      const last = generateRank(first, null);

      // Insert between them
      const middle = generateRank(first, last);

      const ranks = [first, middle, last];
      const sorted = [...ranks].sort();
      expect(sorted).toEqual(ranks);
    });

    test("multiple insertions between same neighbors", () => {
      // This tests the case where we repeatedly insert between two items
      const first = "a";
      const last = "z";

      let prev = first;
      let ranks = [first];

      // Insert 5 items between first and last
      for (let i = 0; i < 5; i++) {
        const newRank = generateRank(prev, last);
        ranks.push(newRank);
        prev = newRank;
      }
      ranks.push(last);

      // Verify all ranks sort in order
      const sorted = [...ranks].sort();
      expect(sorted).toEqual(ranks);
    });
  });

  describe("edge cases", () => {
    test("handles empty string prev", () => {
      const result = generateRank("", "z");
      expect(result < "z").toBe(true);
    });

    test("handles empty string next", () => {
      const result = generateRank("a", "");
      // Empty string sorts before everything, so result should be after 'a'
      expect(result > "a").toBe(true);
    });

    test("handles very long strings", () => {
      const longPrev = "a".repeat(50);
      const longNext = "z".repeat(50);
      const result = generateRank(longPrev, longNext);
      expect(result > longPrev).toBe(true);
      expect(result < longNext).toBe(true);
    });

    test("handles strings of different lengths", () => {
      const result = generateRank("nz", "nzz");
      expect(result > "nz").toBe(true);
      expect(result < "nzz").toBe(true);
    });
  });

  describe("realistic usage patterns", () => {
    test("simulates creating a list of 5 items", () => {
      // Create 5 items one after another
      const r1 = generateRank(null, null); // First item
      const r2 = generateRank(r1, null); // Second at end
      const r3 = generateRank(r2, null); // Third at end
      const r4 = generateRank(r3, null); // Fourth at end
      const r5 = generateRank(r4, null); // Fifth at end

      const ranks = [r1, r2, r3, r4, r5];
      const sorted = [...ranks].sort();
      expect(sorted).toEqual(ranks);
    });

    test("simulates reordering - move last to first", () => {
      // Create 3 items
      const r1 = generateRank(null, null);
      const r2 = generateRank(r1, null);
      const r3 = generateRank(r2, null);

      // Move r3 to before r1
      const r3New = generateRank(null, r1);

      const ranks = [r3New, r1, r2];
      const sorted = [...ranks].sort();
      expect(sorted).toEqual(ranks);
    });

    test("simulates reordering - move first to middle", () => {
      // Create 3 items
      const r1 = generateRank(null, null);
      const r2 = generateRank(r1, null);
      const r3 = generateRank(r2, null);

      // Move r1 to between r2 and r3
      const r1New = generateRank(r2, r3);

      const ranks = [r2, r1New, r3];
      const sorted = [...ranks].sort();
      expect(sorted).toEqual(ranks);
    });
  });
});
