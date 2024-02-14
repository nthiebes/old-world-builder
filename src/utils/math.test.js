import { sum } from "./math";

describe("sum", () => {
  test("should return 0 for an empty list", () => {
    const list = [];
    const getValue = (item) => item;
    expect(sum(list, getValue)).toBe(0);
  });

  test("should return the sum of numbers in the list", () => {
    const list = [1, 2, 3, 4, 5];
    const getValue = (item) => item;
    expect(sum(list, getValue)).toBe(15);
  });

  test("should return the sum of values extracted from objects in the list", () => {
    const list = [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 },
    ];
    const getValue = (item) => item.value;
    expect(sum(list, getValue)).toBe(15);
  });

  test("should return 0 if the list is empty and getValue returns undefined", () => {
    const list = [];
    const getValue = (item) => item.value;
    expect(sum(list, getValue)).toBe(0);
  });

  test("should return the sum of values extracted from objects in the list, ignoring undefined values", () => {
    const list = [
      { value: 1 },
      { value: 2 },
      { value: undefined },
      { value: 4 },
      { value: 5 },
    ];
    const getValue = (item) => item.value;
    expect(sum(list, getValue)).toBe(12);
  });
});
