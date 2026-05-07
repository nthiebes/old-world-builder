import { describe, test, expect } from "vitest";
import { sortByRank, ensureRanks, reorderList, reorderFolder, sortWithPins } from "./list-ordering";

// Helper to create a list item
const makeList = (id, name, rank = null, folder = null) => ({
  id,
  name,
  rank,
  folder,
  type: "list",
});

// Helper to create a folder
const makeFolder = (id, name, rank = null, open = true) => ({
  id,
  name,
  rank,
  folder: null,
  type: "folder",
  open,
});

describe("sortByRank", () => {
  describe("basic sorting", () => {
    test("sorts items by rank alphabetically", () => {
      const lists = [
        makeList("3", "Third", "c"),
        makeList("1", "First", "a"),
        makeList("2", "Second", "b"),
      ];

      const result = sortByRank(lists);
      expect(result.map((l) => l.name)).toEqual(["First", "Second", "Third"]);
    });

    test("items without rank sort to end", () => {
      const lists = [
        makeList("2", "No Rank"),
        makeList("1", "Has Rank", "a"),
      ];

      const result = sortByRank(lists);
      expect(result.map((l) => l.name)).toEqual(["Has Rank", "No Rank"]);
    });

    test("multiple items without rank maintain relative order", () => {
      const lists = [
        makeList("1", "No Rank A"),
        makeList("2", "No Rank B"),
        makeList("3", "Has Rank", "a"),
      ];

      const result = sortByRank(lists);
      expect(result[0].name).toBe("Has Rank");
      // Items without rank come after
    });
  });

  describe("folder grouping", () => {
    test("folder contents appear after their folder", () => {
      const folder = makeFolder("folder1", "My Folder", "b");
      const lists = [
        makeList("3", "Outside List", "c"),
        makeList("1", "Inside List", "a", "folder1"),
        folder,
      ];

      const result = sortByRank(lists);
      expect(result.map((l) => l.name)).toEqual([
        "My Folder",
        "Inside List",
        "Outside List",
      ]);
    });

    test("folder contents sorted by rank within folder", () => {
      const folder = makeFolder("folder1", "My Folder", "a");
      const lists = [
        folder,
        makeList("3", "Third Inside", "c", "folder1"),
        makeList("1", "First Inside", "a", "folder1"),
        makeList("2", "Second Inside", "b", "folder1"),
      ];

      const result = sortByRank(lists);
      expect(result.map((l) => l.name)).toEqual([
        "My Folder",
        "First Inside",
        "Second Inside",
        "Third Inside",
      ]);
    });

    test("multiple folders each group their contents", () => {
      const folder1 = makeFolder("folder1", "Folder A", "a");
      const folder2 = makeFolder("folder2", "Folder B", "c");
      const lists = [
        folder1,
        folder2,
        makeList("1", "In Folder A", "b", "folder1"),
        makeList("2", "In Folder B", "d", "folder2"),
        makeList("3", "Outside", "e"),
      ];

      const result = sortByRank(lists);
      expect(result.map((l) => l.name)).toEqual([
        "Folder A",
        "In Folder A",
        "Folder B",
        "In Folder B",
        "Outside",
      ]);
    });

    test("empty folder works correctly", () => {
      const folder = makeFolder("folder1", "Empty Folder", "a");
      const lists = [
        folder,
        makeList("1", "Outside", "b"),
      ];

      const result = sortByRank(lists);
      expect(result.map((l) => l.name)).toEqual(["Empty Folder", "Outside"]);
    });
  });
});

describe("ensureRanks", () => {
  test("returns needsUpdate: false when all items have ranks", () => {
    const lists = [
      makeList("1", "First", "a"),
      makeList("2", "Second", "b"),
    ];

    const { lists: result, needsUpdate } = ensureRanks(lists);
    expect(needsUpdate).toBe(false);
    expect(result).toEqual(lists);
  });

  test("assigns ranks to items without them", () => {
    const lists = [
      makeList("1", "First"),
      makeList("2", "Second"),
    ];

    const { lists: result, needsUpdate } = ensureRanks(lists);
    expect(needsUpdate).toBe(true);
    expect(result[0].rank).toBeTruthy();
    expect(result[1].rank).toBeTruthy();
  });

  test("preserves existing ranks", () => {
    const lists = [
      makeList("1", "First", "existing"),
      makeList("2", "Second"),
    ];

    const { lists: result } = ensureRanks(lists);
    expect(result[0].rank).toBe("existing");
  });

  test("assigned ranks maintain order", () => {
    const lists = [
      makeList("1", "First"),
      makeList("2", "Second"),
      makeList("3", "Third"),
    ];

    const { lists: result } = ensureRanks(lists);
    const ranks = result.map((l) => l.rank);
    const sorted = [...ranks].sort();
    expect(sorted).toEqual(ranks);
  });

  test("assigns ranks between existing ranks", () => {
    const lists = [
      makeList("1", "First", "a"),
      makeList("2", "No Rank"),
      makeList("3", "Third", "z"),
    ];

    const { lists: result } = ensureRanks(lists);
    expect(result[1].rank > "a").toBe(true);
    expect(result[1].rank < "z").toBe(true);
  });

  test("sets updated_at on newly ranked items", () => {
    const lists = [makeList("1", "First")];

    const { lists: result } = ensureRanks(lists);
    expect(result[0].updated_at).toBeTruthy();
  });

  test("assigns folder from position for legacy items", () => {
    const folder = makeFolder("folder1", "My Folder", "a");
    // Truly legacy item: no folder property at all (undefined, not null)
    const legacyItem = { id: "1", name: "Inside", type: "list" };
    const lists = [folder, legacyItem];

    const { lists: result } = ensureRanks(lists);
    expect(result[1].folder).toBe("folder1");
  });

  test("all items in a folder get unique ranks", () => {
    const folder = makeFolder("folder1", "ABC", "a");
    const lists = [
      folder,
      makeList("1", "First", null, "folder1"),
      makeList("2", "Second", null, "folder1"),
      makeList("3", "Third", null, "folder1"),
      makeList("4", "Fourth", null, "folder1"),
    ];

    const { lists: result } = ensureRanks(lists);
    const folderContents = result.filter((l) => l.folder === "folder1");
    const ranks = folderContents.map((l) => l.rank);

    // All ranks must be unique
    const uniqueRanks = new Set(ranks);
    expect(uniqueRanks.size).toBe(ranks.length);

    // All ranks must sort in order
    const sorted = [...ranks].sort();
    expect(sorted).toEqual(ranks);
  });

  test("uppercase ranks and duplicate ranks dedupe to unique values (regression: production data)", () => {
    // Real production data: "0M" (uppercase, valid with char-code midpoint)
    // and a duplicate "004" between f2 and ASB.
    const lists = [
      makeFolder("f1", "First", "001"),
      makeList("a", "Friday Night", "003"),
      makeFolder("f2", "Second", "004"),
      makeList("b", "Bel Con", "000h", "f2"),
      makeList("c", "Testing", "002", "f2"),
      makeFolder("f3", "ABC", "0M"),
      makeList("d", "ASB", "004", "f3"), // DUPLICATE of f2
      makeList("e", "Cams", "008", "f3"),
    ];

    const { lists: ranked, needsUpdate } = ensureRanks(lists);
    expect(needsUpdate).toBe(true);

    const ranks = ranked.map((l) => l.rank);
    expect(new Set(ranks).size).toBe(ranks.length); // all unique

    // ABC's "0M" should be preserved (uppercase is valid now)
    expect(ranked.find((l) => l.id === "f3").rank).toBe("0M");

    // Idempotent — no infinite loop
    const second = ensureRanks(ranked);
    expect(second.needsUpdate).toBe(false);
  });

  test("multiple top-level items without rank get distinct ranks (no infinite loop)", () => {
    const folder = makeFolder("folder1", "My Folder", "M");
    const lists = [
      folder,
      makeList("a", "List A", null, null),
      makeList("b", "List B", null, null),
      makeList("c", "List C", null, null),
    ];

    const { lists: result, needsUpdate } = ensureRanks(lists);
    expect(needsUpdate).toBe(true);

    const ranks = result.filter((l) => l.id !== "folder1").map((l) => l.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
    ranks.forEach((r) => expect(r < "M").toBe(true));

    // Idempotent: re-running on the result should NOT need an update
    const second = ensureRanks(result);
    expect(second.needsUpdate).toBe(false);
  });

  test("items with identical ranks get deduplicated by ensureRanks", () => {
    const folder = makeFolder("folder1", "ABC", "b");
    const lists = [
      folder,
      makeList("1", "Friday Night", "d", "folder1"),
      makeList("2", "ASB", "m", "folder1"),
      makeList("3", "Cams", "m", "folder1"),
      makeList("4", "Bel Con", "m", "folder1"),
    ];

    // ensureRanks should fix the duplicates
    const { lists: ranked, needsUpdate } = ensureRanks(lists);
    expect(needsUpdate).toBe(true);

    const folderContents = ranked.filter((l) => l.folder === "folder1");
    const ranks = folderContents.map((l) => l.rank);
    const uniqueRanks = new Set(ranks);
    expect(uniqueRanks.size).toBe(ranks.length);

    // After dedup, reordering should work
    const sorted = sortByRank(ranked);
    const belConIdx = sorted.findIndex((l) => l.id === "4");
    const reordered = reorderList(sorted, belConIdx, 1);
    const reSorted = sortByRank(reordered);
    expect(reSorted[1].name).toBe("Bel Con");
  });

  test("top-level list (folder:null) at end of array gets rank before first folder", () => {
    const folder = makeFolder("folder1", "My Folder", "M");
    const insideList = makeList("2", "Inside", "N", "folder1");
    // Simulates a list synced from server with folder:null but no rank,
    // placed at end by sortByRank (no-rank items sort last)
    const newList = makeList("1", "New List", null, null);

    const lists = [folder, insideList, newList];
    const { lists: result } = ensureRanks(lists);

    const ranked = result.find((l) => l.id === "1");
    // Should get a rank that sorts BEFORE the folder
    expect(ranked.rank).toBeTruthy();
    expect(ranked.rank < "M").toBe(true);
    expect(ranked.folder).toBeNull();
  });

  test("top-level list at end gets rank before first folder even with multiple folders", () => {
    const folder1 = makeFolder("f1", "Folder 1", "D");
    const folder2 = makeFolder("f2", "Folder 2", "M");
    const inside1 = makeList("2", "In F1", "E", "f1");
    const inside2 = makeList("3", "In F2", "N", "f2");
    const newList = makeList("1", "New List", null, null);

    const lists = [folder1, inside1, folder2, inside2, newList];
    const { lists: result } = ensureRanks(lists);

    const ranked = result.find((l) => l.id === "1");
    expect(ranked.rank < "D").toBe(true);
    expect(ranked.folder).toBeNull();
  });
});

describe("reorderList", () => {
  describe("basic reordering", () => {
    test("moving item down updates rank correctly", () => {
      const lists = [
        makeList("1", "First", "d"),
        makeList("2", "Second", "m"),
        makeList("3", "Third", "v"),
      ];

      // Move First (index 0) to after Third (index 2 in result)
      const result = reorderList(lists, 0, 2);

      // Find the moved item
      const moved = result.find((l) => l.id === "1");
      expect(moved.rank > "m").toBe(true);
      expect(moved.rank > "v").toBe(true);
    });

    test("moving item up updates rank correctly", () => {
      const lists = [
        makeList("1", "First", "d"),
        makeList("2", "Second", "m"),
        makeList("3", "Third", "v"),
      ];

      // Move Third (index 2) to first position (index 0)
      const result = reorderList(lists, 2, 0);

      const moved = result.find((l) => l.id === "3");
      // Rank should be before "d"
      expect(moved.rank < "d").toBe(true);
    });

    test("moving to middle gets rank between neighbors", () => {
      const lists = [
        makeList("1", "First", "d"),
        makeList("2", "Second", "m"),
        makeList("3", "Third", "v"),
      ];

      // Move Third (index 2) to between First and Second (index 1)
      const result = reorderList(lists, 2, 1);

      const moved = result.find((l) => l.id === "3");
      expect(moved.rank > "d").toBe(true);
      expect(moved.rank < "m").toBe(true);
    });
  });

  describe("folder assignment", () => {
    test("item dragged below folder goes into folder", () => {
      const folder = makeFolder("folder1", "My Folder", "b");
      const lists = [
        makeList("1", "Outside", "a"),
        folder,
        makeList("2", "Inside", "c", "folder1"),
      ];

      // Move Outside (index 0) to after folder (index 2 in visual)
      const result = reorderList(lists, 0, 2);

      const moved = result.find((l) => l.id === "1");
      expect(moved.folder).toBe("folder1");
    });

    test("item dragged above folder has no folder", () => {
      const folder = makeFolder("folder1", "My Folder", "b");
      const lists = [
        folder,
        makeList("1", "Inside", "c", "folder1"),
      ];

      // Move Inside (index 1) to before folder (index 0)
      const result = reorderList(lists, 1, 0);

      const moved = result.find((l) => l.id === "1");
      expect(moved.folder).toBe(null);
    });

    test("item moved from one folder to another", () => {
      const folder1 = makeFolder("folder1", "Folder A", "a");
      const folder2 = makeFolder("folder2", "Folder B", "c");
      const lists = [
        folder1,
        makeList("1", "In A", "b", "folder1"),
        folder2,
        makeList("2", "In B", "d", "folder2"),
      ];

      // Move "In A" (index 1) to after "Folder B" (index 3)
      const result = reorderList(lists, 1, 3);

      const moved = result.find((l) => l.id === "1");
      expect(moved.folder).toBe("folder2");
    });

    test("item moved out of folder to before folder", () => {
      const folder = makeFolder("folder1", "My Folder", "m");
      const lists = [
        makeList("1", "Outside Top", "d"),
        folder,
        makeList("2", "Inside", "v", "folder1"),
      ];

      // Move Inside (index 2) to before folder (index 1)
      // This puts it at position 1, which is above the folder
      const result = reorderList(lists, 2, 1);

      const moved = result.find((l) => l.id === "2");
      // When moved above the folder, it's no longer in the folder
      expect(moved.folder).toBe(null);
    });

    test("item stays in folder when moved below folder", () => {
      const folder = makeFolder("folder1", "My Folder", "d");
      const lists = [
        folder,
        makeList("1", "Inside", "m", "folder1"),
        makeList("2", "Outside", "v"),
      ];

      // Move Outside (index 2) to position 2 (after Inside)
      // This is still below the folder, so it goes INTO the folder
      const result = reorderList(lists, 2, 2);

      const moved = result.find((l) => l.id === "2");
      expect(moved.folder).toBe("folder1");
    });
  });

  describe("collapsed folder handling", () => {
    test("dropping below a closed folder does NOT add to folder", () => {
      const folder = makeFolder("folder1", "Collapsed Folder", "a", false);
      const lists = [
        folder,
        makeList("1", "Hidden Inside", "b", "folder1"),
        makeList("2", "Outside", "d"),
      ];

      // Move Outside to right after the collapsed folder (visual position 1)
      // Since folder is closed, user intent is "after folder", not "into folder"
      const result = reorderList(lists, 2, 1);

      const moved = result.find((l) => l.id === "2");
      // Should NOT be in the folder — folder is closed
      expect(moved.folder).toBe(null);
      // Should rank after the hidden content so it appears below the folder
      expect(moved.rank > "b").toBe(true);
    });

    test("dropping right after a closed folder ranks past its hidden children", () => {
      // Hidden children have height:0 but still occupy rbd flat indices.
      // If `next` isn't advanced past them, we end up with a degenerate
      // range like generateRank(lastChildRank, firstChildRank) and the new
      // item lands inside the hidden range.
      const folder = makeFolder("folder1", "Collapsed", "a", false);
      const lists = [
        folder,
        makeList("c1", "Child 1", "b", "folder1"),
        makeList("c2", "Child 2", "d", "folder1"),
        makeList("after", "Top-level After", "m"),
        makeList("source", "Source", "z"),
      ];

      // Drop source at flat-index 1 (right after the closed folder header,
      // before its hidden children in rbd flat space).
      const result = reorderList(lists, 4, 1);

      const moved = result.find((l) => l.id === "source");
      // Should land AFTER the whole collapsed group, BEFORE "Top-level After".
      expect(moved.rank > "d").toBe(true);
      expect(moved.rank < "m").toBe(true);
      expect(moved.folder).toBe(null);
    });

    test("reordering items within an open folder keeps them in the folder", () => {
      const folder = makeFolder("folder1", "My Folder", "a", true);
      const lists = [
        folder,
        makeList("1", "First Inside", "b", "folder1"),
        makeList("2", "Second Inside", "c", "folder1"),
        makeList("3", "Third Inside", "d", "folder1"),
      ];

      // Move Third (index 3) to above First (index 1)
      const result = reorderList(lists, 3, 1);
      const sorted = sortByRank(result);

      // All three should still be in the folder
      expect(sorted[1].folder).toBe("folder1");
      expect(sorted[2].folder).toBe("folder1");
      expect(sorted[3].folder).toBe("folder1");

      // Third should now be first inside the folder
      expect(sorted[1].id).toBe("3");
    });

    test("reordering items within a folder preserves folder membership", () => {
      const folder = makeFolder("folder1", "My Folder", "a", true);
      const lists = [
        makeList("0", "Outside Top", "0"),
        folder,
        makeList("1", "First Inside", "b", "folder1"),
        makeList("2", "Second Inside", "c", "folder1"),
        makeList("3", "Outside Bottom", "z"),
      ];

      // Move Second Inside (index 3) above First Inside (index 2)
      const result = reorderList(lists, 3, 2);
      const moved = result.find((l) => l.id === "2");

      expect(moved.folder).toBe("folder1");
      // Second now sorts FIRST among folder1's children.
      const sorted = sortByRank(result);
      const childIds = sorted.filter((l) => l.folder === "folder1").map((l) => l.id);
      expect(childIds).toEqual(["2", "1"]);
    });

    test("dropping below an open folder DOES add to folder", () => {
      const folder = makeFolder("folder1", "Open Folder", "a", true);
      const lists = [
        folder,
        makeList("1", "Inside", "b", "folder1"),
        makeList("2", "Outside", "d"),
      ];

      const result = reorderList(lists, 2, 1);

      const moved = result.find((l) => l.id === "2");
      expect(moved.folder).toBe("folder1");
    });
  });

  describe("edge cases", () => {
    test("handles moving to first position", () => {
      const lists = [
        makeList("1", "First", "d"),
        makeList("2", "Second", "m"),
      ];

      const result = reorderList(lists, 1, 0);
      const moved = result.find((l) => l.id === "2");
      expect(moved.rank < "d").toBe(true);
    });

    test("handles moving to last position", () => {
      const lists = [
        makeList("1", "First", "d"),
        makeList("2", "Second", "m"),
        makeList("3", "Third", "v"),
      ];

      const result = reorderList(lists, 0, 2);
      const moved = result.find((l) => l.id === "1");
      expect(moved.rank > "m").toBe(true);
    });

    test("sets updated_at on moved item", () => {
      const lists = [
        makeList("1", "First", "a"),
        makeList("2", "Second", "b"),
      ];

      const result = reorderList(lists, 0, 2);
      const moved = result.find((l) => l.id === "1");
      expect(moved.updated_at).toBeTruthy();
    });

    test("does not modify other items", () => {
      const lists = [
        makeList("1", "First", "a"),
        makeList("2", "Second", "b"),
      ];

      const result = reorderList(lists, 0, 2);
      const unchanged = result.find((l) => l.id === "2");
      expect(unchanged.rank).toBe("b");
      expect(unchanged.updated_at).toBeUndefined();
    });
  });
});

describe("reorderFolder", () => {
  describe("folder movement", () => {
    test("moving folder updates only folder rank", () => {
      const folder = makeFolder("folder1", "My Folder", "b");
      const lists = [
        makeList("1", "First", "a"),
        folder,
        makeList("2", "Inside", "c", "folder1"),
        makeList("3", "Outside", "d"),
      ];

      // rbd dest = new-array index. Folder ends up at last position (index 3
      // in the 4-item new array, since source is removed and re-inserted).
      const result = reorderFolder(lists, 1, 3);

      const movedFolder = result.find((l) => l.id === "folder1");
      expect(movedFolder.rank > "d").toBe(true);

      // Contents keep same folder reference and rank
      const content = result.find((l) => l.id === "2");
      expect(content.folder).toBe("folder1");
      expect(content.rank).toBe("c");
    });

    test("moving folder to beginning", () => {
      const folder = makeFolder("folder1", "My Folder", "v");
      const lists = [
        makeList("1", "First", "d"),
        makeList("2", "Second", "m"),
        folder,
      ];

      const result = reorderFolder(lists, 2, 0);

      const movedFolder = result.find((l) => l.id === "folder1");
      expect(movedFolder.rank < "d").toBe(true);
    });

    test("moving folder between other items", () => {
      const folder = makeFolder("folder1", "My Folder", "a");
      const lists = [
        folder,
        makeList("1", "Inside", "b", "folder1"),
        makeList("2", "Outside 1", "c"),
        makeList("3", "Outside 2", "d"),
      ];

      // rbd dest = new-array index. Folder lands at position 2 in the new
      // array [Inside, Outside 1, FOLDER, Outside 2] = between Outside 1
      // and Outside 2.
      const result = reorderFolder(lists, 0, 2);

      const movedFolder = result.find((l) => l.id === "folder1");
      expect(movedFolder.rank > "c").toBe(true);
      expect(movedFolder.rank < "d").toBe(true);
    });
  });

  describe("folder contents follow automatically", () => {
    test("sortByRank groups contents after moved folder", () => {
      const folder = makeFolder("folder1", "My Folder", "z");
      const lists = [
        makeList("1", "First", "a"),
        folder,
        makeList("2", "Inside", "b", "folder1"),
      ];

      // After sorting, folder at end means contents follow
      const sorted = sortByRank(lists);
      expect(sorted.map((l) => l.name)).toEqual([
        "First",
        "My Folder",
        "Inside",
      ]);
    });
  });

  describe("collapsed folder handling", () => {
    test("moving after collapsed folder ranks correctly", () => {
      const folder1 = makeFolder("folder1", "Open Folder", "a");
      const folder2 = makeFolder("folder2", "Collapsed Folder", "c", false);
      const lists = [
        folder1,
        makeList("1", "Inside Open", "b", "folder1"),
        folder2,
        makeList("2", "Hidden", "d", "folder2"),
      ];

      // Move Open Folder after Collapsed Folder
      const result = reorderFolder(lists, 0, 3);

      const movedFolder = result.find((l) => l.id === "folder1");
      // Should rank after the hidden content
      expect(movedFolder.rank > "d").toBe(true);
    });
  });

  describe("delegates to reorderList for non-folders", () => {
    test("regular list items use reorderList", () => {
      const lists = [
        makeList("1", "First", "d"),
        makeList("2", "Second", "m"),
        makeList("3", "Third", "v"),
      ];

      const result = reorderFolder(lists, 0, 2);

      const moved = result.find((l) => l.id === "1");
      expect(moved.rank > "m").toBe(true);
    });
  });

  describe("edge cases", () => {
    test("dragging top folder to bottom of multi-folder list moves rank past last", () => {
      // Production repro: top folder dragged to bottom previously stayed at
      // its original rank because the loop counted "before destIndex" in the
      // OLD list (off-by-one when source < dest).
      const top = makeFolder("top", "Top", "001");
      const lists = [
        top,
        makeList("a", "Friday", "003"),
        makeFolder("abc", "ABC", "003h"),
        makeList("b", "ASB", "005", "abc"),
        makeList("c", "Cams", "008", "abc"),
        makeFolder("snd", "Second", "004"),
        makeList("d", "Bel Con", "000h", "snd"),
        makeList("e", "Testing", "002", "snd"),
      ];

      // Drag top folder (source 0) to last position (rbd dest = length-1 = 7)
      const result = reorderFolder(lists, 0, 7);

      const movedFolder = result.find((l) => l.id === "top");
      // Must sort AFTER all current top-level ranks (max is "004")
      expect(movedFolder.rank > "004").toBe(true);
      expect(movedFolder.rank).not.toBe("001");
    });

    test("sets updated_at on moved folder", () => {
      const folder = makeFolder("folder1", "My Folder", "a");
      const lists = [
        folder,
        makeList("1", "Outside", "b"),
      ];

      // rbd dest = new-array index. Last position in 2-item new array = 1.
      const result = reorderFolder(lists, 0, 1);
      const movedFolder = result.find((l) => l.id === "folder1");
      expect(movedFolder.updated_at).toBeTruthy();
    });
  });
});

describe("lists without ranks (import, new list, sync)", () => {
  test("imported list without rank can be reordered correctly", () => {
    // Existing lists have ranks
    const existing = [
      makeList("1", "First", "d"),
      makeList("2", "Second", "m"),
    ];

    // Simulate importing a list (no rank, prepended to array)
    const imported = makeList("3", "Imported");
    const lists = [imported, ...existing];

    // sortByRank should place no-rank item last
    const sorted = sortByRank(lists);
    expect(sorted[2].name).toBe("Imported");

    // Now reorder: move Imported (index 2) to first position
    const reordered = reorderList(sorted, 2, 0);
    const reSorted = sortByRank(reordered);

    // Imported should now be first and have a rank
    expect(reSorted[0].name).toBe("Imported");
    expect(reSorted[0].rank).toBeTruthy();
    expect(reSorted[0].rank < "d").toBe(true);
  });

  test("multiple imported lists without ranks can be reordered between ranked items", () => {
    const lists = [
      makeList("1", "Ranked A", "d"),
      makeList("2", "No Rank X"),
      makeList("3", "No Rank Y"),
      makeList("4", "Ranked B", "v"),
    ];

    const sorted = sortByRank(lists);
    // Ranked items should be first, no-rank items last
    expect(sorted[0].name).toBe("Ranked A");
    expect(sorted[1].name).toBe("Ranked B");

    // After ensureRanks, all should have ranks and be reorderable
    const { lists: withRanks } = ensureRanks(sorted);
    expect(withRanks.every((l) => l.rank)).toBe(true);

    // Reorder last item to first
    const reordered = reorderList(withRanks, 3, 0);
    const reSorted = sortByRank(reordered);
    expect(reSorted[0].id).toBe(withRanks[3].id);
  });

  test("new list without rank prepended to ranked lists gets correct position after ensureRanks", () => {
    const existing = [
      makeList("1", "First", "d"),
      makeList("2", "Second", "m"),
    ];

    // Simulate creating a new list (no rank, prepended)
    const newList = makeList("3", "New List");
    const lists = [newList, ...existing];

    // ensureRanks should give it a rank that preserves its position at the front
    const { lists: ranked } = ensureRanks(lists);
    expect(ranked[0].rank).toBeTruthy();
    expect(ranked[0].rank < "d").toBe(true);
    expect(ranked[0].name).toBe("New List");
  });

  test("synced lists without ranks mixed with ranked lists all get ranks via ensureRanks", () => {
    // Simulates Dropbox sync bringing in lists without ranks
    const lists = [
      makeList("1", "Local Ranked", "m"),
      makeList("2", "Synced No Rank A"),
      makeList("3", "Synced No Rank B"),
    ];

    const { lists: ranked, needsUpdate } = ensureRanks(lists);
    expect(needsUpdate).toBe(true);
    expect(ranked.every((l) => l.rank)).toBe(true);

    // Ranks should preserve order
    const ranks = ranked.map((l) => l.rank);
    const sorted = [...ranks].sort();
    expect(sorted).toEqual(ranks);
  });

  test("imported list dragged into a folder gets correct folder assignment", () => {
    const folder = makeFolder("folder1", "My Folder", "b");
    const existing = [
      folder,
      makeList("1", "Inside", "c", "folder1"),
      makeList("2", "Outside", "e"),
    ];

    // Simulate import: no rank, prepended
    const imported = makeList("3", "Imported");
    const lists = sortByRank([imported, ...existing]);

    // Imported should be last (no rank)
    expect(lists[lists.length - 1].name).toBe("Imported");

    // Give it a rank via ensureRanks
    const { lists: ranked } = ensureRanks(lists);

    // Now drag it into the folder (after the folder header, index 1)
    const importedIndex = ranked.findIndex((l) => l.id === "3");
    const reordered = reorderList(ranked, importedIndex, 1);
    const sorted = sortByRank(reordered);

    const moved = sorted.find((l) => l.id === "3");
    expect(moved.folder).toBe("folder1");
    expect(moved.rank).toBeTruthy();
  });

  test("new list created with rank can be immediately dragged into a folder", () => {
    const folder = makeFolder("folder1", "My Folder", "m");
    const existing = [
      makeList("1", "Top", "d"),
      folder,
      makeList("2", "Inside", "n", "folder1"),
    ];

    // New list created with a rank (before first item)
    const newList = { ...makeList("3", "New"), rank: "a", folder: null };
    const lists = sortByRank([newList, ...existing]);

    expect(lists[0].name).toBe("New");

    // Drag into folder (after folder header at index 2, drop at index 3)
    const reordered = reorderList(lists, 0, 3);
    const sorted = sortByRank(reordered);

    const moved = sorted.find((l) => l.id === "3");
    expect(moved.folder).toBe("folder1");
  });

  test("reordering a no-rank item directly (without ensureRanks) still assigns a rank", () => {
    // Edge case: user drags a no-rank item before ensureRanks runs
    const lists = [
      makeList("1", "Ranked", "m"),
      makeList("2", "No Rank"),
    ];

    const sorted = sortByRank(lists);
    // No Rank is at index 1 (sorted last)
    expect(sorted[1].name).toBe("No Rank");

    // Move it to first position
    const reordered = reorderList(sorted, 1, 0);
    const moved = reordered.find((l) => l.id === "2");

    // Should now have a rank
    expect(moved.rank).toBeTruthy();
    expect(moved.rank < "m").toBe(true);
  });
});

describe("newly created folders", () => {
  test("new folder with rank allows dropping items below it", () => {
    // Simulate: existing lists, then user creates a folder at top
    const existing = [
      makeList("1", "List A", "m"),
      makeList("2", "List B", "v"),
    ];
    const firstRank = existing[0].rank;
    const newFolder = makeFolder("folder1", "New Folder", "d"); // rank before firstRank
    newFolder.rank = "d"; // explicitly before "m"
    const lists = sortByRank([newFolder, ...existing]);

    // Folder should be first
    expect(lists[0].name).toBe("New Folder");
    expect(lists[0].rank).toBe("d");

    // Drag List B (index 2) to just below folder (index 1)
    const reordered = reorderList(lists, 2, 1);
    const sorted = sortByRank(reordered);

    const moved = sorted.find((l) => l.id === "2");
    expect(moved.folder).toBe("folder1");
  });

  test("folder without rank causes items to not enter folder on drop", () => {
    // This is the bug case: folder created without a rank
    const noRankFolder = { ...makeFolder("folder1", "Bad Folder"), rank: null };
    const lists = [
      makeList("1", "List A", "d"),
      makeList("2", "List B", "m"),
    ];

    // sortByRank pushes no-rank folder to end
    const sorted = sortByRank([noRankFolder, ...lists]);
    expect(sorted[sorted.length - 1].name).toBe("Bad Folder");

    // ensureRanks should fix it
    const { lists: ranked } = ensureRanks(sorted);
    const folder = ranked.find((l) => l.id === "folder1");
    expect(folder.rank).toBeTruthy();

    // Now reordering should work
    const reSorted = sortByRank(ranked);
    const listAIdx = reSorted.findIndex((l) => l.id === "1");
    // Drop List A right after the folder header. reorderList takes the
    // POST-removal index (matching rbd's destination.index), so when listA
    // sits before the folder, "right after folder header" maps to the
    // folder's post-removal index + 1.
    const folderIdxPost = reSorted.findIndex((l) => l.id === "folder1") - (listAIdx < reSorted.findIndex((l) => l.id === "folder1") ? 1 : 0);
    const reordered = reorderList(reSorted, listAIdx, folderIdxPost + 1);
    const finalSorted = sortByRank(reordered);

    const moved = finalSorted.find((l) => l.id === "1");
    expect(moved.folder).toBe("folder1");
  });
});

describe("integration: reorder then sort", () => {
  test("full workflow: reorder items then sort produces correct order", () => {
    const folder = makeFolder("folder1", "My Folder", "b");
    const lists = [
      makeList("1", "First", "a"),
      folder,
      makeList("2", "Inside", "c", "folder1"),
      makeList("3", "Last", "d"),
    ];

    // Move "First" into the folder. Post-removal layout is
    // [folder, Inside, Last]; drop right after folder header = idx 1.
    const reordered = reorderList(lists, 0, 1);
    const sorted = sortByRank(reordered);

    // First should now be inside folder
    const movedItem = sorted.find((l) => l.id === "1");
    expect(movedItem.folder).toBe("folder1");

    // Folder should contain both items
    const folderIndex = sorted.findIndex((l) => l.id === "folder1");
    expect(sorted[folderIndex + 1].folder).toBe("folder1");
    expect(sorted[folderIndex + 2].folder).toBe("folder1");
  });

  test("workflow: create list, add items, reorder", () => {
    // Simulate creating a new list with ensureRanks
    const initial = [
      makeList("1", "First"),
      makeList("2", "Second"),
      makeList("3", "Third"),
    ];

    const { lists: withRanks } = ensureRanks(initial);

    // Reorder: move Third to first position
    const reordered = reorderList(withRanks, 2, 0);
    const sorted = sortByRank(reordered);

    expect(sorted[0].name).toBe("Third");
    expect(sorted[1].name).toBe("First");
    expect(sorted[2].name).toBe("Second");
  });
});

// ---------------------------------------------------------------------------
// sortWithPins
// ---------------------------------------------------------------------------
describe("sortWithPins", () => {
  const list = (id, opts = {}) => ({ id, name: id, type: opts.type, folder: opts.folder, pinned_at: opts.pinned_at });

  test("top-level pinned floats above all folders", () => {
    const lists = [
      list("L1"),
      list("F1", { type: "folder" }),
      list("L2", { folder: "F1" }),
      list("L3", { pinned_at: "2026-01-01T00:00:00Z" }),
    ];
    const sorted = sortWithPins(lists);
    expect(sorted.map((l) => l.id)).toEqual(["L3", "L1", "F1", "L2"]);
  });

  test("multiple top-level pinned ordered by pinned_at ascending", () => {
    const lists = [
      list("F1", { type: "folder" }),
      list("L1", { pinned_at: "2026-02-01T00:00:00Z" }),
      list("L2", { pinned_at: "2026-01-01T00:00:00Z" }),
    ];
    const sorted = sortWithPins(lists);
    expect(sorted.map((l) => l.id)).toEqual(["L2", "L1", "F1"]);
  });

  test("folder-content pinned floats to top of its folder, not to global top", () => {
    const lists = [
      list("L1"),
      list("F1", { type: "folder" }),
      list("L2", { folder: "F1" }),
      list("L3", { folder: "F1", pinned_at: "2026-01-01T00:00:00Z" }),
    ];
    const sorted = sortWithPins(lists);
    expect(sorted.map((l) => l.id)).toEqual(["L1", "F1", "L3", "L2"]);
  });

  test("top-level pinned + folder-content pinned coexist correctly", () => {
    const lists = [
      list("L_top"),
      list("F1", { type: "folder" }),
      list("L_in", { folder: "F1" }),
      list("L_in_pin", { folder: "F1", pinned_at: "2026-01-01T00:00:00Z" }),
      list("L_top_pin", { pinned_at: "2026-01-02T00:00:00Z" }),
    ];
    const sorted = sortWithPins(lists);
    expect(sorted.map((l) => l.id)).toEqual([
      "L_top_pin", // top-level pin → very top
      "L_top",     // unpinned top-level keeps rank position
      "F1",
      "L_in_pin", // pin within folder → top of folder
      "L_in",
    ]);
  });

  test("folders never push above top-level pinned even when folder rank is first", () => {
    const lists = [
      list("F1", { type: "folder" }),
      list("L1", { pinned_at: "2026-01-01T00:00:00Z" }),
    ];
    const sorted = sortWithPins(lists);
    expect(sorted[0].id).toBe("L1");
    expect(sorted[1].id).toBe("F1");
  });
});

// ---------------------------------------------------------------------------
// reorderList — drag bugs from real-user snapshots (TDD)
// ---------------------------------------------------------------------------
describe("reorderList — real-snapshot scenarios", () => {
  // Build a stripped-down post-sortByRank visual layout matching snap-1.
  // sourceIndex 2 = Mark Long, the user dragged him to "first place inside
  // Tournament Submits". TS is at idx 3, BB-Summer (TS child) at 4, Liam
  // (TS child) at 5. Post-removal drop position between TS and BB-Summer
  // is destinationIndex 3.
  const snap1Lists = () => [
    { id: "liam-top", name: "Liam top", rank: "Hhhh", folder: null, type: undefined },
    { id: "cory", name: "Cory", rank: "Yyv", folder: null, type: undefined },
    { id: "mark", name: "Mark", rank: "Yyx", folder: null, type: undefined },
    { id: "ts", name: "Tournament Submits", rank: "Z", folder: null, type: "folder", open: true },
    { id: "bb-summer", name: "BB-Summer", rank: "Yh", folder: "ts", type: undefined },
    { id: "liam-in-ts", name: "Liam in TS", rank: "h", folder: "ts", type: undefined },
  ];

  test("dragging top-level item into open folder at first position lands it first inside that folder", () => {
    const lists = snap1Lists();
    const result = reorderList(lists, 2, 3); // mark from idx 2, drop between TS and BB-Summer

    const mark = result.find((l) => l.id === "mark");
    expect(mark.folder).toBe("ts");

    // Sort TS children by rank; mark must be FIRST.
    const tsChildren = result
      .filter((l) => l.folder === "ts")
      .sort((a, b) => (a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0));
    expect(tsChildren[0].id).toBe("mark");
    expect(tsChildren[0].rank).not.toBe("Yyx"); // rank MUST have changed
  });

  test("rank assigned in folder must compare LESS than the folder's first existing child", () => {
    const lists = snap1Lists();
    const result = reorderList(lists, 2, 3);
    const mark = result.find((l) => l.id === "mark");
    const bb = result.find((l) => l.id === "bb-summer");
    expect(mark.rank < bb.rank).toBe(true);
  });

  // Snap-2 → snap-3 drag-out scenario. Mark Long is now in TS at rank Yyx,
  // visual idx 27 of 51. User drags him out and rbd reports a destination
  // somewhere between top-level items where the nearest preceding folder
  // header is New Folder (folder-lcvbkbhb), causing him to silently land
  // in NF instead of top-level.
  const snap2Lists = () => [
    { id: "nf", name: "New Folder", rank: "07", folder: null, type: "folder", open: true },
    { id: "calum-nf", name: "Calum in NF", rank: "Yyy", folder: "nf", type: undefined },
    { id: "summer-slam", name: "Summer Slam", rank: "YyyU", folder: "nf", type: undefined },
    { id: "bb-settra", name: "BB-Settra", rank: "2", folder: null, type: undefined },
    { id: "ts", name: "Tournament Submits", rank: "Z", folder: null, type: "folder", open: true },
    { id: "bb-summer", name: "BB-Summer", rank: "Yh", folder: "ts", type: undefined },
    { id: "mark", name: "Mark", rank: "Yyx", folder: "ts", type: undefined },
    { id: "liam-in-ts", name: "Liam in TS", rank: "h", folder: "ts", type: undefined },
    { id: "battle", name: "Battle march", rank: "q", folder: null, type: "folder", open: true },
  ];

  test("dragging item out of folder to position between last child and next folder header — stays in folder (last position)", () => {
    const lists = snap2Lists();
    // Mark at idx 6 (in TS). Drop right after Liam (TS's last child), just
    // before Battle folder header. Post-removal idx 7. prev=Liam (folder=ts),
    // next=Battle (folder header) → "last position in TS" semantics.
    const result = reorderList(lists, 6, 7);
    const mark = result.find((l) => l.id === "mark");
    expect(mark.folder).toBe("ts");
  });

  test("dragging item out of folder to between top-level items above its folder — lands at top-level (not in earlier folder)", () => {
    const lists = snap2Lists();
    // Mark at idx 6 (in TS). User drags up; rbd reports drop position 4
    // (between bb-settra and TS header). Walk-back via OLD logic would skip
    // bb-settra and NF children, landing in NF — the bug. New logic uses
    // next item's context: next=TS header → top-level.
    const result = reorderList(lists, 6, 4);
    const mark = result.find((l) => l.id === "mark");
    expect(mark.folder).toBeNull();
  });

  test("dragging item out of folder to between NF child and a top-level item — lands at top-level", () => {
    const lists = snap2Lists();
    // Drop position 3 (between summer-slam (last NF child) and bb-settra
    // (top-level)). prev=summer-slam (folder=nf), next=bb-settra (top-level).
    // Boundary out of NF — top-level.
    const result = reorderList(lists, 6, 3);
    const mark = result.find((l) => l.id === "mark");
    expect(mark.folder).toBeNull();
  });

  test("dragging top-level item just below a folder's last child to a position before BB-Settra — anchors against folder header, not the folder child", () => {
    // Reproduces a follow-on bug: Mark is at top-level (rank 03), NF folder
    // is open (rank 07) with children Calum/Summer Slam, BB-Settra is the
    // first top-level after the folder. User drags Mark from his top-level
    // slot to "just above BB-Settra". The drop position is between
    // Summer Slam (NF child, rank YyyU) and BB-Settra (rank 2). Old code
    // anchored on Summer Slam → generateRank(YyyU, 2) = "I", which sorts
    // Mark below Liam Meikle (rank Hhhh < I < O). Fix walks past folder
    // children to find NF (the same-context prev) → rank between 07 and 2.
    const lists = [
      { id: "wed", name: "Wed", rank: "H", pinned_at: "2026-01-01T00:00:00Z" },
      { id: "mark", name: "Mark", rank: "03" },
      { id: "nf", name: "NF", rank: "07", type: "folder", open: true },
      { id: "calum", name: "Calum", rank: "Yyy", folder: "nf" },
      { id: "summer", name: "Summer", rank: "YyyU", folder: "nf" },
      { id: "bb-settra", name: "BB-Settra", rank: "2" },
      { id: "chorfs", name: "Chorfs", rank: "5g" },
      { id: "liam", name: "Liam", rank: "Hhhh" },
      { id: "keith", name: "Keith", rank: "O" },
    ];
    const visual = sortWithPins(sortByRank(lists));
    // visual: [wed (pinned), mark, nf, calum, summer, bb-settra, chorfs, liam, keith]
    const markIdx = visual.findIndex((l) => l.id === "mark");
    const bbIdx = visual.findIndex((l) => l.id === "bb-settra");
    // Drop just before BB-Settra. markIdx < bbIdx → post-removal BB at bbIdx-1.
    const dest = bbIdx - 1;

    const result = reorderList(visual, markIdx, dest);
    const mark = result.find((l) => l.id === "mark");

    expect(mark.folder).toBeNull();
    // Sort against top-level rank space: between NF (07) and BB-Settra (2).
    expect(mark.rank > "07").toBe(true);
    expect(mark.rank < "2").toBe(true);
    // Specifically NOT in the H..O range where Liam/Keith live.
    expect(mark.rank < "5g").toBe(true);
  });

  test("dragging from inside folder to top-level position immediately above the folder header (when prev is pinned)", () => {
    // Reproduces the production bug: pinned 'Wed night orcs' (rank H) floats
    // to the top, New Folder (rank 07) is the first non-pinned item, with
    // Mark inside NF. Dropping Mark just above NF and below Wed should land
    // him as the first top-level item. With the old code, generateRank('H',
    // '07') produced rank '8', placing Mark below BB-Settra (rank '2') —
    // way below where the user intended.
    const lists = [
      { id: "wed", name: "Wed night orcs", rank: "H", pinned_at: "2026-01-01T00:00:00Z" },
      { id: "nf", name: "New Folder", rank: "07", type: "folder", open: true },
      { id: "mark", name: "Mark", rank: "Yyx", folder: "nf" },
      { id: "calum", name: "Calum", rank: "Yyy", folder: "nf" },
      { id: "summer", name: "Summer Slam", rank: "YyyU", folder: "nf" },
      { id: "bb-settra", name: "BB-Settra", rank: "2" },
      { id: "chorfs", name: "Chorfs", rank: "5g" },
      { id: "cold", name: "Cold WSWG", rank: "8" },
    ];

    // Visual layout post-sortWithPins is: [wed (pinned), nf, mark, calum,
    // summer, bb-settra, chorfs, cold]. Mark is at idx 2; user drops him
    // between wed (idx 0) and nf (idx 1). Post-removal layout:
    // [wed, nf, calum, summer, bb-settra, chorfs, cold]; drop at idx 1.
    const visual = sortWithPins(sortByRank(lists));
    const markIdx = visual.findIndex((l) => l.id === "mark");
    const result = reorderList(visual, markIdx, 1);
    const mark = result.find((l) => l.id === "mark");

    // Top-level (out of folder).
    expect(mark.folder).toBeNull();
    // And rank should sort BEFORE NF so visually first non-pinned.
    expect(mark.rank < "07").toBe(true);
    // And NOT below BB-Settra (the original bug).
    expect(mark.rank < "2").toBe(true);
  });
});

// ---------------------------------------------------------------------------
// dropFolderFor — direct unit tests for the placement rule
// ---------------------------------------------------------------------------
import { dropFolderFor } from "./list-ordering";

describe("dropFolderFor", () => {
  test("right after open folder header → inside folder", () => {
    const list = [
      { id: "f", type: "folder", open: true },
      { id: "a", folder: "f" },
    ];
    expect(dropFolderFor(list, 1)).toBe("f");
  });

  test("right after closed folder header → top-level", () => {
    const list = [
      { id: "f", type: "folder", open: false },
      { id: "a", folder: "f" },
    ];
    expect(dropFolderFor(list, 1)).toBe(null);
  });

  test("between two children of same folder → that folder", () => {
    const list = [
      { id: "a", folder: "f" },
      { id: "b", folder: "f" },
    ];
    expect(dropFolderFor(list, 1)).toBe("f");
  });

  test("between folder X's last child and a top-level item → top-level (drag-out boundary; phantom slot serves drag-in)", () => {
    const list = [
      { id: "a", folder: "f" },
      { id: "b", folder: null },
    ];
    expect(dropFolderFor(list, 1)).toBe(null);
  });

  test("between folder X's last child and another folder header → stays in X (last)", () => {
    const list = [
      { id: "a", folder: "f" },
      { id: "g", type: "folder", open: true },
    ];
    expect(dropFolderFor(list, 1)).toBe("f");
  });

  test("right after an empty open folder header (next is anything) → INSIDE that folder", () => {
    const list = [
      { id: "f", type: "folder", open: true },
      { id: "after", folder: null },
    ];
    expect(dropFolderFor(list, 1)).toBe("f");
  });

  test("right after an empty open folder header at end of list → INSIDE that folder", () => {
    const list = [{ id: "f", type: "folder", open: true }];
    expect(dropFolderFor(list, 1)).toBe("f");
  });

  test("phantom rows are skipped as rank anchors so reorderList uses the previous real sibling", () => {
    // The folder-X last child (rank "c") is being dropped onto the phantom
    // slot. Without skipping the phantom, prev becomes the rankless phantom
    // → generateRank(null, null) and the item lands arbitrarily within X.
    const lists = [
      { id: "f", type: "folder", rank: "a", open: true },
      { id: "first", folder: "f", rank: "b" },
      { id: "moved", folder: "f", rank: "c" }, // currently last child of f
      { id: `phantom-f`, _phantom: true, folder: "f" },
      { id: "outside", folder: null, rank: "z" },
    ];
    // Drop "moved" onto the phantom slot. Visual is already the same; rbd
    // would report sourceIndex=2, destinationIndex=2 (phantom's post-removal
    // index). reorderList should anchor against "first" (the real previous
    // sibling), not the phantom.
    const result = reorderList(lists, 2, 2);
    const moved = result.find((l) => l.id === "moved");
    expect(moved.folder).toBe("f");
    expect(moved.rank > "b").toBe(true);
  });

  test("phantom-as-next anchors the drop INTO the phantom's folder", () => {
    // Home.jsx inserts a phantom after each open folder's last child to
    // make "drop into folder, last position" reachable. Phantoms have
    // folder=X and no rank.
    const list = [
      { id: "child", folder: "f" },
      { id: "phantom-f", _phantom: true, folder: "f" },
      { id: "next", folder: null },
    ];
    // Drop AT the phantom slot (between child and phantom): both have
    // folder=f → in f.
    expect(dropFolderFor(list, 1)).toBe("f");
    // Drop AFTER the phantom (between phantom and next top-level item):
    // boundary out → top-level.
    expect(dropFolderFor(list, 2)).toBe(null);
  });

  test("at end of list when prev is folder child → stays in that folder (last)", () => {
    const list = [{ id: "a", folder: "f" }];
    expect(dropFolderFor(list, 1)).toBe("f");
  });

  test("between two top-level items → top-level", () => {
    const list = [{ id: "a" }, { id: "b" }];
    expect(dropFolderFor(list, 1)).toBe(null);
  });

  test("dropping above a folder header (next is folder) when prev is top-level → top-level", () => {
    const list = [
      { id: "a", folder: null },
      { id: "f", type: "folder", open: true },
    ];
    expect(dropFolderFor(list, 1)).toBe(null);
  });

  test("dropping above a folder child when prev is top-level → into that folder", () => {
    const list = [
      { id: "top", folder: null },
      { id: "child", folder: "f" },
    ];
    expect(dropFolderFor(list, 1)).toBe("f");
  });
});

// ---------------------------------------------------------------------------
// Stress: random drag-drop combinations on a realistic fixture
// (Inspired by an exhaustive scan of a real-user 51-list snapshot — covers
// inverted-bounds folders, prefix-pair ranks, near-MIN ranks, closed folders,
// and pinned items. Deterministic via mulberry32 seeded RNG so failures are
// reproducible.)
// ---------------------------------------------------------------------------
describe("reorderList — randomised stress on realistic fixture", () => {
  const FIXTURE = [
    // Pinned tops
    { id: "p1", name: "Pinned A", rank: "0F", pinned_at: "2026-03-22T23:42:36.133Z" },
    { id: "p2", name: "Pinned B", rank: "7", pinned_at: "2026-03-22T23:42:42.561Z" },
    // Folder rank '07' (near-MIN) with children spanning ranks
    { id: "f-near-min", name: "Near Min", type: "folder", rank: "07", open: true },
    { id: "fc1", name: "Yyy", rank: "Yyy", folder: "f-near-min" },
    { id: "fc2", name: "YyyU", rank: "YyyU", folder: "f-near-min" },
    // Top-level run including prefix pairs
    { id: "t1", name: "BB-Settra", rank: "2" },
    { id: "t2", name: "Cold WSWG", rank: "8" },
    { id: "t3", name: "Calum top", rank: "9" },
    { id: "t4", name: "Liam-top long", rank: "Hhhh" },
    { id: "t5", name: "Cameron", rank: "Y" },
    { id: "t6", name: "Wed waaaagh", rank: "YU" },
    { id: "t7", name: "Jabe", rank: "Yy" },
    { id: "t8", name: "Morgan", rank: "YyU" },
    { id: "t9", name: "Adam Southwell", rank: "Yyr" },
    { id: "t10", name: "Cory Mathis", rank: "Yyv" },
    { id: "t11", name: "Mark Long", rank: "Yyx" },
    // INVERTED-BOUNDS folder: rank "Z" but children "Yh" and "h"
    { id: "f-inverted", name: "TS", type: "folder", rank: "Z", open: true },
    { id: "ic1", name: "BB-Summer", rank: "Yh", folder: "f-inverted" },
    { id: "ic2", name: "Liam-in-TS", rank: "h", folder: "f-inverted" },
    // Closed folder
    { id: "f-closed", name: "Battle", type: "folder", rank: "q", open: false },
    { id: "cc1", name: "War", rank: "r", folder: "f-closed", pinned_at: "2026-05-01T00:00:00Z" },
    { id: "cc2", name: "Hallowed", rank: "tzmzK", folder: "f-closed" },
    // Open folder with many lowercase children
    { id: "f-many", name: "Sync", type: "folder", rank: "u", open: true },
    { id: "mc1", name: "Double Shag", rank: "w", folder: "f-many" },
    { id: "mc2", name: "Summer Sling", rank: "x", folder: "f-many" },
    { id: "mc3", name: "Where Ogre", rank: "y", folder: "f-many" },
    { id: "mc4", name: "Michel Jago", rank: "yU", folder: "f-many" },
    { id: "mc5", name: "Colin G WH", rank: "yg", folder: "f-many" },
  ];

  // Deterministic PRNG so any failure is reproducible.
  const mulberry32 = (seed) => () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const baseLists = (() => {
    const ensured = ensureRanks(FIXTURE).lists;
    return sortWithPins(sortByRank(ensured));
  })();

  test("50 random drag-drops: no rank collisions, no invalid folders, ensureRanks preserves", () => {
    const rng = mulberry32(0xbb_50);
    const N = 50;
    const failures = [];

    for (let i = 0; i < N; i++) {
      let src;
      do {
        src = Math.floor(rng() * baseLists.length);
      } while (baseLists[src].type === "folder");
      let dest;
      do {
        dest = Math.floor(rng() * baseLists.length);
      } while (dest === src);

      const result = reorderList(baseLists, src, dest);
      const moved = result.find((l) => l.id === baseLists[src].id);

      const ranks = result.map((l) => l.rank).filter(Boolean);
      const seen = new Set();
      for (const r of ranks) {
        if (seen.has(r)) {
          failures.push({ i, src, dest, kind: "collision", dup: r });
          break;
        }
        seen.add(r);
      }

      if (moved.folder && !result.some((l) => l.id === moved.folder && l.type === "folder")) {
        failures.push({ i, src, dest, kind: "invalid-folder", folder: moved.folder });
      }

      const { lists: ensuredAgain } = ensureRanks(result);
      const after = ensuredAgain.find((l) => l.id === moved.id).rank;
      if (after !== moved.rank) {
        failures.push({ i, src, dest, kind: "ensureRanks-regressed", before: moved.rank, after });
      }
    }

    if (failures.length) {
      // Surface first 5 failures inline; full list goes to the assertion message.
      console.log("Stress failures:", failures.slice(0, 5));
    }
    expect(failures).toEqual([]);
  });

  test("50 random folder reorders: no rank collisions, child counts preserved", () => {
    const rng = mulberry32(0xbb_5f);
    const N = 50;
    const folderSrcs = baseLists
      .map((l, i) => (l.type === "folder" ? i : -1))
      .filter((i) => i >= 0);
    const failures = [];

    for (let i = 0; i < N; i++) {
      const src = folderSrcs[Math.floor(rng() * folderSrcs.length)];
      let dest;
      do {
        dest = Math.floor(rng() * baseLists.length);
      } while (dest === src);

      const result = reorderFolder(baseLists, src, dest);
      const ranks = result.map((l) => l.rank).filter(Boolean);
      const seen = new Set();
      for (const r of ranks) {
        if (seen.has(r)) {
          failures.push({ i, src, dest, kind: "collision", dup: r });
          break;
        }
        seen.add(r);
      }
      const folderId = baseLists[src].id;
      const before = baseLists.filter((l) => l.folder === folderId).length;
      const after = result.filter((l) => l.folder === folderId).length;
      if (before !== after) failures.push({ i, src, dest, kind: "child-count", before, after });
    }

    if (failures.length) console.log("Folder stress failures:", failures.slice(0, 5));
    expect(failures).toEqual([]);
  });
});
