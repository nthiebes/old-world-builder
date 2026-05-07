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
      updated_at: new Date().toISOString(),
    };
  });

  return { lists: result, needsUpdate };
};

// Float pinned items.
//   - Top-level pinned (no folder): hoisted to the very top, ABOVE any folder,
//     in pinned_at ascending order. Folders never push above pinned lists.
//   - Folder-content pinned: hoisted to the top of that folder's contents.
// Runs after sortByRank.
export const sortWithPins = (lists) => {
  const topLevelPinned = [];
  const remaining = [];
  for (const item of lists) {
    if (item.type !== "folder" && !item.folder && item.pinned_at) {
      topLevelPinned.push(item);
    } else {
      remaining.push(item);
    }
  }
  topLevelPinned.sort((a, b) => new Date(a.pinned_at) - new Date(b.pinned_at));

  const result = [...topLevelPinned];
  let i = 0;
  while (i < remaining.length) {
    const item = remaining[i];
    if (item.type === "folder") {
      result.push(item);
      i++;
      const contents = [];
      while (i < remaining.length && remaining[i].folder === item.id) {
        contents.push(remaining[i]);
        i++;
      }
      const pinned = contents
        .filter((c) => c.pinned_at)
        .sort((a, b) => new Date(a.pinned_at) - new Date(b.pinned_at));
      const unpinned = contents.filter((c) => !c.pinned_at);
      result.push(...pinned, ...unpinned);
    } else {
      result.push(item);
      i++;
    }
  }
  return result;
};

// Decide which folder a drop position falls into. Shared by reorderList
// (commits the rank) and handleDragUpdate (shows the visual indent cue) so
// they agree.
//
// To make "drop into the last position of an open folder" reachable, Home.jsx
// inserts a phantom drop-zone item after each open folder's last child (or
// right after the header for empty open folders). Phantoms have folder=X so
// they match the same-folder branches below; dropping past the phantom lands
// on top-level naturally.
export const dropFolderFor = (withoutItem, insertAt) => {
  const prev = withoutItem[insertAt - 1] || null;
  const next = withoutItem[insertAt] || null;

  if (prev?.type === "folder") {
    return prev.open === false ? null : prev.id;
  }
  if (prev?.folder) {
    if (!next) return prev.folder;
    if (next.folder === prev.folder) return prev.folder;
    if (next.type === "folder") return prev.folder;
    if (next.folder) return prev.folder;
    return null;
  }
  if (next?.folder && next.type !== "folder") {
    return next.folder;
  }
  return null;
};

// Choose a rank that doesn't collide with any existing rank in `lists`.
// generateRank is unaware of in-use ranks — when it picks one that's already
// taken, ensureRanks would later see a duplicate and reassign by JSON array
// position, often back to the very rank we wanted to replace. Tighten the
// lower bound iteratively until we land on a free slot.
const uniqueRankBetween = (prevRank, nextRank, used) => {
  let candidate = generateRank(prevRank, nextRank);
  let lower = prevRank;
  while (used.has(candidate)) {
    lower = candidate;
    candidate = generateRank(lower, nextRank);
  }
  return candidate;
};

export const reorderList = (lists, sourceIndex, destIndex) => {
  const item = lists[sourceIndex];

  const withoutItem = lists.filter((_, i) => i !== sourceIndex);
  const insertAt = destIndex;

  const prev = withoutItem[insertAt - 1] || null;
  let next = withoutItem[insertAt] || null;

  const newFolder = dropFolderFor(withoutItem, insertAt);

  // If dropping after a collapsed folder, advance both bounds past its
  // hidden children so the new rank lands cleanly after the whole group.
  // (Hidden children have height:0 but still occupy rbd flat indices.)
  // Rank-prev / rank-next must come from the SAME context as the new
  // folder placement, otherwise we'd anchor against an unrelated rank
  // space. E.g. dropping a top-level item just past a folder's children
  // would anchor on those children's rank (high in lex), which then
  // sorts the new item way down the top-level run. Walk to find anchors
  // that share context (top-level + folder headers, OR same-folder
  // children), skipping pinned floaters at the top level.
  const sameContext = (c) => {
    if (!c) return false;
    // Phantom drop-slots have no real rank — they exist only to give the
    // user a target for "drop into folder, last position". Anchoring rank
    // against them would push generateRank into a (null, null) call and
    // place the item arbitrarily within the folder.
    if (c._phantom) return false;
    if (newFolder === null) {
      // Pinned top-level items float to the visual top — they don't sit
      // at their rank position, so they're invalid rank anchors.
      if (c.pinned_at && !c.folder && c.type !== "folder") return false;
      return c.type === "folder" || !c.folder;
    }
    return c.folder === newFolder;
  };
  let prevRank = null;
  for (let i = insertAt - 1; i >= 0; i--) {
    if (sameContext(withoutItem[i])) {
      prevRank = withoutItem[i].rank || null;
      break;
    }
  }
  let nextRank = null;
  for (let i = insertAt; i < withoutItem.length; i++) {
    if (sameContext(withoutItem[i])) {
      nextRank = withoutItem[i].rank || null;
      break;
    }
  }

  const usedRanks = new Set(
    lists.filter((l) => l.id !== item.id && l.rank).map((l) => l.rank),
  );
  const newRank = uniqueRankBetween(prevRank, nextRank, usedRanks);

  return lists.map((l) =>
    l.id === item.id
      ? { ...l, rank: newRank, folder: newFolder, updated_at: new Date().toISOString() }
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

  const usedRanks = new Set(
    lists.filter((l) => l.id !== folder.id && l.rank).map((l) => l.rank),
  );
  const newRank = uniqueRankBetween(prevRank, next?.rank || null, usedRanks);

  return lists.map((l) =>
    l.id === folder.id
      ? { ...l, rank: newRank, updated_at: new Date().toISOString() }
      : l,
  );
};
