import { describe, test, expect, beforeEach } from "vitest";
import { updateLocalList, removeFromLocalList } from "./list";

// Mock localStorage
const storage = {};
const localStorageMock = {
  getItem: (key) => storage[key] || null,
  setItem: (key, value) => { storage[key] = value; },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((key) => delete storage[key]); },
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe("updateLocalList", () => {
  test("updates the matching list in localStorage", () => {
    const lists = [
      { id: "1", name: "First" },
      { id: "2", name: "Second" },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    updateLocalList({ id: "1", name: "Updated First" });

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0].name).toBe("Updated First");
    expect(result[1].name).toBe("Second");
  });

  test("merges partial updates and preserves other fields", () => {
    const lists = [
      {
        id: "folder-1",
        name: "My Folder",
        type: "folder",
        open: true,
        rank: "h",
        folder: null,
      },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    // Folder toggle only passes id/name/type/open
    updateLocalList({ id: "folder-1", name: "My Folder", type: "folder", open: false });

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0]).toEqual({
      id: "folder-1",
      name: "My Folder",
      type: "folder",
      open: false,
      rank: "h",
      folder: null,
    });
  });
});

describe("removeFromLocalList", () => {
  test("removes the list from localStorage", () => {
    const lists = [
      { id: "1", name: "First" },
      { id: "2", name: "Second" },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    removeFromLocalList("1");

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result).toEqual([{ id: "2", name: "Second" }]);
  });

  test("does not modify other lists", () => {
    const lists = [
      { id: "1", name: "First" },
      { id: "2", name: "Second" },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    removeFromLocalList("2");

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result).toEqual([{ id: "1", name: "First" }]);
  });

  test("is a no-op when the id is not present", () => {
    const lists = [{ id: "1", name: "First" }];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    removeFromLocalList("nonexistent");

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result).toEqual([{ id: "1", name: "First" }]);
  });
});
