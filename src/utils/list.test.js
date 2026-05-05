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

    updateLocalList({ id: "folder-1", name: "My Folder", type: "folder", open: false });

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0]).toMatchObject({
      id: "folder-1",
      name: "My Folder",
      type: "folder",
      open: false,
      rank: "h",
      folder: null,
    });
  });

  test("bumps updated_at when `open` changes (folder toggle)", () => {
    const lists = [
      {
        id: "folder-1",
        name: "My Folder",
        type: "folder",
        open: true,
        rank: "h",
        folder: null,
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    const before = new Date().toISOString();
    updateLocalList({ id: "folder-1", open: false });
    const after = new Date().toISOString();

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0].open).toBe(false);
    expect(result[0].updated_at >= before).toBe(true);
    expect(result[0].updated_at <= after).toBe(true);
  });

  test("bumps updated_at when name changes", () => {
    const lists = [
      {
        id: "1",
        name: "Old name",
        rank: "h",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    const before = new Date().toISOString();
    updateLocalList({ id: "1", name: "New name" });
    const after = new Date().toISOString();

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0].name).toBe("New name");
    expect(result[0].updated_at >= before).toBe(true);
    expect(result[0].updated_at <= after).toBe(true);
  });

  test("does not bump updated_at when nothing changed", () => {
    const lists = [
      {
        id: "1",
        name: "Same",
        rank: "h",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    updateLocalList({ id: "1", name: "Same" });

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0].updated_at).toBe("2026-01-01T00:00:00.000Z");
  });

  test("is a no-op when the id is not present", () => {
    const lists = [{ id: "1", name: "Keep", updated_at: "2026-01-01T00:00:00.000Z" }];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    updateLocalList({ id: "nonexistent", name: "Whatever" });

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result).toEqual([{ id: "1", name: "Keep", updated_at: "2026-01-01T00:00:00.000Z" }]);
  });
});

describe("removeFromLocalList", () => {
  test("replaces the list with a slim tombstone", () => {
    const lists = [
      {
        id: "1",
        name: "First",
        units: [{ id: "u1" }],
        points: 1500,
        rank: "0|hzzzzz:",
      },
      { id: "2", name: "Second" },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    removeFromLocalList("1");

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({
      id: "1",
      _deleted: true,
      updated_at: expect.any(String),
    });
    expect(result[1]._deleted).toBeUndefined();
  });

  test("sets updated_at on the deleted list", () => {
    const lists = [{ id: "1", name: "First" }];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    const before = new Date().toISOString();
    removeFromLocalList("1");
    const after = new Date().toISOString();

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0].updated_at >= before).toBe(true);
    expect(result[0].updated_at <= after).toBe(true);
  });

  test("does not modify other lists", () => {
    const lists = [
      { id: "1", name: "First" },
      { id: "2", name: "Second" },
    ];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    removeFromLocalList("2");

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result[0]).toEqual({ id: "1", name: "First" });
  });

  test("is a no-op when the id is not present", () => {
    const lists = [{ id: "1", name: "First" }];
    localStorage.setItem("owb.lists", JSON.stringify(lists));

    removeFromLocalList("nonexistent");

    const result = JSON.parse(localStorage.getItem("owb.lists"));
    expect(result).toEqual([{ id: "1", name: "First" }]);
  });
});
