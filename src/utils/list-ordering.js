import { generateRank, isValidRank } from "./lexorank";

const byRank = (a, b) => {
  if (!a.rank && !b.rank) return 0;
  if (!a.rank) return 1;
  if (!b.rank) return -1;
  if (a.rank < b.rank) return -1;
  if (a.rank > b.rank) return 1;
  return 0;
};

export const sortByRank = (lists) => {
  const topLevel = lists.filter(
    (l) => l.folder === null || l.folder === undefined || l.type === "folder"
  );

  const sortedTopLevel = [...topLevel].sort(byRank);

  const result = [];
  for (const item of sortedTopLevel) {
    result.push(item);

    if (item.type === "folder") {
      const contents = lists
        .filter((l) => l.folder === item.id)
        .sort(byRank);
      result.push(...contents);
    }
  }

  return result;
};

export const rankAtTop = (lists) => {
  const sorted = sortByRank(lists);
  return generateRank(null, sorted[0]?.rank || null);
};

// Ranks within `source`'s folder context — siblings outside the folder
// don't constrain the position.
export const rankAfter = (lists, source) => {
  const siblingFolder = source?.folder || null;
  const siblings = lists
    .filter((l) => (l.folder || null) === siblingFolder)
    .slice()
    .sort(byRank);
  const idx = siblings.findIndex((l) => l.id === source?.id);
  const next = idx >= 0 ? siblings[idx + 1] : null;
  return generateRank(source?.rank || null, next?.rank || null);
};

export const ensureRanks = (lists) => {
  let lastRank = null;
  let needsUpdate = false;
  let currentFolder = null;
  const seenRanks = new Set();

  const firstFolderRank =
    lists.find((l) => l.type === "folder" && isValidRank(l.rank))?.rank || null;

  const result = lists.map((list, index) => {
    if (list.type === "folder") {
      currentFolder = list.id;
    }

    if (isValidRank(list.rank) && !seenRanks.has(list.rank)) {
      seenRanks.add(list.rank);
      lastRank = list.rank;
      return list;
    }

    // Legacy migration: items without an explicit folder field inherit
    // currentFolder from their array position (pre-rank lists relied on
    // position to convey containment).
    const newFolder = list.type === "folder"
      ? list.folder
      : (list.folder !== undefined ? list.folder : currentFolder);

    // Top-level items rank before the first folder regardless of array
    // position. Use lastRank as the lower bound so multiple top-level items
    // each get a distinct rank instead of collapsing to the same midpoint.
    let newRank;
    if (newFolder === null && list.type !== "folder" && firstFolderRank) {
      const lower = lastRank && lastRank < firstFolderRank ? lastRank : null;
      newRank = generateRank(lower, firstFolderRank);
    } else {
      const nextWithRank = lists.slice(index + 1).find((l) => l.rank);
      newRank = generateRank(lastRank, nextWithRank?.rank);
    }

    // Guarantee uniqueness even if midpoint lands on an existing rank
    // (corrupted data or unfortunate spacing). Appending "h" extends the
    // string to a strictly-greater value that no prior rank can match.
    while (seenRanks.has(newRank)) {
      newRank = newRank + "h";
    }

    needsUpdate = true;
    lastRank = newRank;
    seenRanks.add(newRank);

    return {
      ...list,
      rank: newRank,
      folder: newFolder,
    };
  });

  return { lists: result, needsUpdate };
};

export const reorderList = (lists, sourceIndex, destIndex) => {
  const item = lists[sourceIndex];

  const withoutItem = lists.filter((_, i) => i !== sourceIndex);
  const insertAt = destIndex;

  const prev = withoutItem[insertAt - 1] || null;
  let next = withoutItem[insertAt] || null;

  let newFolder = null;
  for (let i = insertAt - 1; i >= 0; i--) {
    if (withoutItem[i]?.type === "folder") {
      if (withoutItem[i].open === false) break;
      newFolder = withoutItem[i].id;
      break;
    }
  }

  // If dropping after a collapsed folder, advance BOTH bounds past its
  // hidden children so the new rank lands cleanly after the whole group.
  // (Hidden children have height:0 but still occupy rbd flat indices, so
  // `next` could otherwise be a hidden child, producing a degenerate range.)
  let prevRank = prev?.rank || null;
  if (prev?.type === "folder" && prev.open === false) {
    const contents = lists.filter((l) => l.folder === prev.id);
    if (contents.length > 0) {
      const last = contents.reduce((a, b) =>
        (b.rank || "") > (a.rank || "") ? b : a,
      );
      prevRank = last.rank;
    }
    let i = insertAt;
    while (i < withoutItem.length && withoutItem[i]?.folder === prev.id) {
      i++;
    }
    next = withoutItem[i] || null;
  }

  const newRank = generateRank(prevRank, next?.rank || null);

  return lists.map((l) =>
    l.id === item.id
      ? { ...l, rank: newRank, folder: newFolder }
      : l
  );
};

export const reorderFolder = (lists, sourceIndex, destIndex) => {
  const folder = lists[sourceIndex];

  if (folder?.type !== "folder") {
    return reorderList(lists, sourceIndex, destIndex);
  }

  // rbd's destIndex is the position in the NEW array (after removing source).
  // Operate on the post-removal array so destIndex maps correctly regardless
  // of whether source < dest or source > dest.
  const contentIds = new Set(
    lists.filter((l) => l.folder === folder.id).map((l) => l.id),
  );
  const withoutFolder = lists.filter((_, i) => i !== sourceIndex);

  // Find the nearest neighbor on each side, skipping the folder's own
  // contents (they'll follow the folder visually after sortByRank groups
  // them again).
  let prev = null;
  for (let i = destIndex - 1; i >= 0; i--) {
    if (!contentIds.has(withoutFolder[i].id)) {
      prev = withoutFolder[i];
      break;
    }
  }
  let next = null;
  for (let i = destIndex; i < withoutFolder.length; i++) {
    if (!contentIds.has(withoutFolder[i].id)) {
      next = withoutFolder[i];
      break;
    }
  }

  // If prev is a collapsed folder, advance both bounds past its hidden
  // contents so the moved folder lands cleanly after the whole group.
  let prevRank = prev?.rank || null;
  if (prev?.type === "folder" && prev.open === false) {
    const contents = lists.filter((l) => l.folder === prev.id);
    if (contents.length > 0) {
      const last = contents.reduce((a, b) =>
        (b.rank || "") > (a.rank || "") ? b : a,
      );
      prevRank = last.rank;
    }
    for (let i = destIndex; i < withoutFolder.length; i++) {
      const item = withoutFolder[i];
      if (contentIds.has(item.id)) continue;
      if (item.folder === prev.id) continue;
      next = item;
      break;
    }
    if (next?.folder === prev.id) next = null;
  }

  const newRank = generateRank(prevRank, next?.rank || null);

  return lists.map((l) =>
    l.id === folder.id ? { ...l, rank: newRank } : l,
  );
};
