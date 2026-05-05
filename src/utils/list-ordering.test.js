import { describe, test, expect } from "vitest";
import { sortByRank, ensureRanks, reorderList, reorderFolder } from "./list-ordering";

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

  test("stamps updated_at on items it migrates so the new rank syncs", () => {
    // Two clients running ensureRanks independently on the same legacy data
    // would otherwise generate different ranks AND keep identical (legacy)
    // updated_at values, leaving sync unable to converge.
    const lists = [
      { id: "1", name: "Has rank", rank: "h", updated_at: "2026-01-01T00:00:00.000Z" },
      { id: "2", name: "No rank yet", updated_at: "2026-01-01T00:00:00.000Z" },
    ];

    const before = new Date().toISOString();
    const { lists: result } = ensureRanks(lists);
    const after = new Date().toISOString();

    // Untouched item keeps its original updated_at.
    expect(result.find((l) => l.id === "1").updated_at).toBe("2026-01-01T00:00:00.000Z");

    // Migrated item gets a fresh updated_at so sync recognises it as dirty.
    const migrated = result.find((l) => l.id === "2");
    expect(migrated.updated_at >= before).toBe(true);
    expect(migrated.updated_at <= after).toBe(true);
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
      expect(moved.rank < "b").toBe(true);
      expect(moved.rank > "a").toBe(true);
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

    test("does not modify other items", () => {
      const lists = [
        makeList("1", "First", "a"),
        makeList("2", "Second", "b"),
      ];

      const result = reorderList(lists, 0, 2);
      const unchanged = result.find((l) => l.id === "2");
      expect(unchanged.rank).toBe("b");
    });
  });

  describe("updated_at stamping", () => {
    test("stamps updated_at on the moved item so sync sees it as dirty", () => {
      const lists = [
        { ...makeList("1", "First", "d"), updated_at: "2026-01-01T00:00:00.000Z" },
        { ...makeList("2", "Second", "m"), updated_at: "2026-01-01T00:00:00.000Z" },
      ];

      const before = new Date().toISOString();
      const result = reorderList(lists, 0, 1);
      const after = new Date().toISOString();

      const moved = result.find((l) => l.id === "1");
      expect(moved.updated_at >= before).toBe(true);
      expect(moved.updated_at <= after).toBe(true);
    });

    test("does not stamp updated_at on untouched items", () => {
      const lists = [
        { ...makeList("1", "First", "d"), updated_at: "2026-01-01T00:00:00.000Z" },
        { ...makeList("2", "Second", "m"), updated_at: "2026-01-01T00:00:00.000Z" },
      ];

      const result = reorderList(lists, 0, 1);
      const unchanged = result.find((l) => l.id === "2");
      expect(unchanged.updated_at).toBe("2026-01-01T00:00:00.000Z");
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
  });

  describe("updated_at stamping", () => {
    test("stamps updated_at on the moved folder so sync sees it as dirty", () => {
      const folder = { ...makeFolder("folder1", "My Folder", "b"), updated_at: "2026-01-01T00:00:00.000Z" };
      const lists = [
        { ...makeList("1", "First", "a"), updated_at: "2026-01-01T00:00:00.000Z" },
        folder,
        { ...makeList("2", "Second", "c"), updated_at: "2026-01-01T00:00:00.000Z" },
      ];

      const before = new Date().toISOString();
      const result = reorderFolder(lists, 1, 2);
      const after = new Date().toISOString();

      const moved = result.find((l) => l.id === "folder1");
      expect(moved.updated_at >= before).toBe(true);
      expect(moved.updated_at <= after).toBe(true);
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
    const folderIdx = reSorted.findIndex((l) => l.id === "folder1");
    // Drop List A below the folder
    const listAIdx = reSorted.findIndex((l) => l.id === "1");
    const reordered = reorderList(reSorted, listAIdx, folderIdx + 1);
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

    // Move "First" into the folder (after folder header)
    const reordered = reorderList(lists, 0, 2);
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
