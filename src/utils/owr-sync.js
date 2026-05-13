/**
 * OWR Cloud Sync - Per-list delta sync with soft deletes.
 *
 * API contract:
 *   GET  /api/builder/sync?synced_at=...  → { lists, synced_at, changed }
 *   POST /api/builder/sync                → { lists: dirty, known: manifest }
 *                                         ← { lists, synced_at, deleted_ids }
 */

import { sortByRank } from "./list-ordering";
import { owrFetch } from "./owr-fetch";

const owrBaseUrl =
  import.meta.env.VITE_OWR_BASE_URL || "https://oldworldrankings.com";

const SYNC_DEBOUNCE_MS = 10000;
const SYNC_RETRY_INTERVAL_MS = 60000;
const MIN_SYNC_ANIMATION_MS = 600;
const SOFT_DELETE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let syncTimeout = null;
let isSyncing = false;
let hasPendingChanges = false;
let pendingSync = false;
let periodicSyncTimer = null;
let serverSyncedAt = null;
let syncStateListeners = [];
let cloudSyncEntitled = true; // Default true — backwards compatible when server doesn't send the field

// --- State management ---

export const subscribeSyncState = (listener) => {
  syncStateListeners.push(listener);
  listener(getSyncState());
  return () => {
    syncStateListeners = syncStateListeners.filter((l) => l !== listener);
  };
};

export const getSyncState = () => ({
  isSyncing,
  hasPendingChanges,
  cloudSyncEntitled,
});

const notifySyncState = () => {
  const state = getSyncState();
  syncStateListeners.forEach((listener) => listener(state));
};

// --- Sync engine ---

/**
 * Push lists to OWR (debounced).
 * Called after list edits to batch changes before sending.
 * Silently skips if user is not entitled to cloud sync (non-Pro).
 */
export const pushToOWR = () => {
  if (!cloudSyncEntitled) return;
  if (syncTimeout) clearTimeout(syncTimeout);
  hasPendingChanges = true;
  notifySyncState();
  startPeriodicSync();

  syncTimeout = setTimeout(async () => {
    await syncListsNow();
  }, SYNC_DEBOUNCE_MS);
};

/**
 * Force an immediate bidirectional sync.
 * Called when user clicks the sync button.
 * Returns merged lists (without deleted) or null on failure.
 */
export const owrForceSync = async () => {
  if (isSyncing) return null;
  if (syncTimeout) clearTimeout(syncTimeout);

  const startTime = Date.now();
  isSyncing = true;
  notifySyncState();

  try {
    const merged = await runSyncRoundTrip();
    hasPendingChanges = false;
    return merged.filter((l) => !l._deleted);
  } catch {
    return null;
  } finally {
    await ensureMinAnimation(startTime);
    isSyncing = false;
    notifySyncState();
  }
};

/**
 * Upload all local data to OWR (conflict resolution: use local).
 */
export const uploadLocalDataToOWR = async ({ dispatch, settings }) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists")) || [];
  const timestampedLists = addTimestamps(localLists);

  try {
    const res = await owrFetch(`${owrBaseUrl}/api/builder/sync`, {
      method: "POST",
      body: JSON.stringify({ lists: timestampedLists, known: buildKnownManifest(timestampedLists) }),
    });

    if (!res || !res.ok) throw new Error("Upload failed");

    const data = await res.json();
    if (data.synced_at) serverSyncedAt = data.synced_at;

    const newSettings = { ...settings, lastSynced: settings.lastChanged };
    dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
    dispatch(updateSetting({ lastSynced: newSettings.lastSynced }));
    localStorage.setItem("owb.settings", JSON.stringify(newSettings));

    if (data.lists) {
      const mergedLists = applySyncResponse(localLists, data, timestampedLists);
      dispatch(setLists(mergedLists.filter((l) => !l._deleted)));
      localStorage.setItem("owb.lists", JSON.stringify(mergedLists));
    }
  } catch {
    dispatch(updateLogin({ isSyncing: false, syncConflict: false, syncError: true }));
  }
};

/**
 * Download all remote data from OWR (conflict resolution: use remote).
 */
export const downloadRemoteDataFromOWR = async ({ dispatch }) => {
  try {
    const res = await owrFetch(`${owrBaseUrl}/api/builder/sync`);
    if (!res || !res.ok) throw new Error("Download failed");

    const data = await res.json();
    if (data.synced_at) serverSyncedAt = data.synced_at;

    if (data.lists) {
      const remoteLists = data.lists.filter((l) => !l._deleted);
      const settings = JSON.parse(localStorage.getItem("owb.settings")) || {};
      const newSettings = {
        ...settings,
        lastSynced: data.synced_at || new Date().toString(),
        lastChanged: data.synced_at || new Date().toString(),
      };

      dispatch(setLists(remoteLists));
      dispatch(setSettings(newSettings));
      dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
      localStorage.setItem("owb.lists", JSON.stringify(data.lists));
      localStorage.setItem("owb.settings", JSON.stringify(newSettings));
    } else {
      dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
    }
  } catch {
    dispatch(updateLogin({ isSyncing: false, syncConflict: false, syncError: true }));
  }
};

/**
 * Sync lists triggered by auto-sync interval or after login.
 * Detects conflicts and dispatches to Redux for UI handling.
 */
export const owrSyncLists = async ({ dispatch }) => {
  const accessToken = localStorage.getItem("owb.owrAccessToken");
  if (isSyncing || !accessToken || !cloudSyncEntitled) return;

  dispatch(updateLogin({ isSyncing: true, syncError: false }));
  const startTime = Date.now();
  isSyncing = true;
  notifySyncState();

  try {
    const settings = JSON.parse(localStorage.getItem("owb.settings")) || {};
    const merged = await runSyncRoundTrip();

    dispatch(setLists(merged.filter((l) => !l._deleted)));
    dispatch(updateLogin({ isSyncing: false }));
    dispatch(updateSetting({ lastSynced: settings.lastChanged }));
    localStorage.setItem(
      "owb.settings",
      JSON.stringify({ ...settings, lastSynced: settings.lastChanged }),
    );
    hasPendingChanges = false;
  } catch {
    dispatch(
      updateLogin({ isSyncing: false, loggedIn: false, loginLoading: false }),
    );
    localStorage.removeItem("owb.owrAccessToken");
    localStorage.removeItem("owb.owrRefreshToken");
  } finally {
    await ensureMinAnimation(startTime);
    isSyncing = false;
    notifySyncState();
  }
};

// --- Internal helpers ---

const runSyncRoundTrip = async () => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists")) || [];
  const timestampedLists = addTimestamps(localLists);
  const { dirty, known } = splitDirtyLists(timestampedLists);

  const res = await owrFetch(`${owrBaseUrl}/api/builder/sync`, {
    method: "POST",
    body: JSON.stringify({ lists: dirty, known }),
  });
  if (!res || !res.ok) throw new Error("Push failed");

  const data = await res.json();
  const currentLocal = JSON.parse(localStorage.getItem("owb.lists")) || [];
  const merged = applySyncResponse(currentLocal, data, dirty);
  localStorage.setItem("owb.lists", JSON.stringify(merged));
  return merged;
};

const syncListsNow = async () => {
  if (isSyncing) {
    pendingSync = true;
    return;
  }

  const startTime = Date.now();
  isSyncing = true;
  notifySyncState();

  try {
    await runSyncRoundTrip();
    hasPendingChanges = false;
  } catch {
    // Will retry via periodic sync
  } finally {
    await ensureMinAnimation(startTime);
    isSyncing = false;
    notifySyncState();

    if (pendingSync) {
      pendingSync = false;
      await syncListsNow();
    }
  }
};

const startPeriodicSync = () => {
  if (periodicSyncTimer) return;
  periodicSyncTimer = setInterval(async () => {
    if (!hasPendingChanges || isSyncing) return;
    await syncListsNow();
  }, SYNC_RETRY_INTERVAL_MS);
};

const addTimestamps = (lists) =>
  lists.map((list) => ({
    ...list,
    updated_at: list.updated_at || new Date().toISOString(),
  }));

const seedDirtyFromLists = () => {
  const lists = JSON.parse(localStorage.getItem("owb.lists")) || [];
  const seeded = new Set(lists.map((l) => l.id).filter(Boolean));
  localStorage.setItem("owb.dirtyIds", JSON.stringify([...seeded]));
  return seeded;
};

const getDirtyIds = () => {
  const raw = localStorage.getItem("owb.dirtyIds");
  if (raw === null) return seedDirtyFromLists();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedDirtyFromLists();
    return new Set(parsed);
  } catch {
    return seedDirtyFromLists();
  }
};

const setDirtyIds = (set) => {
  localStorage.setItem("owb.dirtyIds", JSON.stringify([...set]));
};

export const markDirty = (id) => {
  if (!id) return;
  const set = getDirtyIds();
  if (set.has(id)) return;
  set.add(id);
  setDirtyIds(set);
};

const clearDirty = (ids) => {
  if (!ids?.length) return;
  const set = getDirtyIds();
  let mutated = false;
  for (const id of ids) {
    if (set.delete(id)) mutated = true;
  }
  if (mutated) setDirtyIds(set);
};

const splitDirtyLists = (timestampedLists, dirtyIds = getDirtyIds()) => {
  const known = buildKnownManifest(timestampedLists);
  const dirty = timestampedLists.filter((list) => dirtyIds.has(list.id));
  return { dirty, known };
};

const buildKnownManifest = (lists) => {
  const known = {};
  lists.forEach((list) => {
    if (list.id && list.updated_at) {
      known[list.id] = list.updated_at;
    }
  });
  return known;
};

const applySyncResponse = (localLists, data, dirtySent = []) => {
  if (data.synced_at) serverSyncedAt = data.synced_at;
  if (data.cloud_sync_entitled !== undefined) {
    cloudSyncEntitled = !!data.cloud_sync_entitled;
    notifySyncState();
  }

  // Only clear ids whose content hasn't moved on since we sent it. If the user
  // edited the same list during the round trip its updated_at advanced, and
  // markDirty was a no-op (id already in the set) — checking updated_at here
  // is what keeps that edit on the next sync.
  const currentById = new Map(
    (JSON.parse(localStorage.getItem("owb.lists")) || []).map((l) => [l.id, l]),
  );
  const acked = dirtySent
    .filter(
      (sent) =>
        sent?.id && currentById.get(sent.id)?.updated_at === sent.updated_at,
    )
    .map((sent) => sent.id);
  clearDirty(acked);

  let result;
  if (data.deleted_ids) {
    result = applyDelta(localLists, data.lists || [], data.deleted_ids);
  } else if (data.lists) {
    result = mergeLists(localLists, data.lists);
  } else {
    result = localLists;
  }

  const ackedTombstones = new Set();
  for (const list of dirtySent) {
    if (list && list._deleted) ackedTombstones.add(list.id);
  }
  if (!ackedTombstones.size) return result;

  return result.filter(
    (list) => !ackedTombstones.has(list.id) || !list._deleted,
  );
};

const applyDelta = (localLists, deltaLists, deletedIds) => {
  const deleteSet = new Set(deletedIds || []);
  const deltaMap = new Map();
  deltaLists.forEach((list) => deltaMap.set(list.id, list));

  const localIds = new Set();
  const result = [];

  localLists.forEach((list) => {
    localIds.add(list.id);
    if (deleteSet.has(list.id)) return;
    if (deltaMap.has(list.id)) {
      const delta = deltaMap.get(list.id);
      if (delta._deleted) return;
      result.push(delta);
    } else {
      if (list._deleted) return;
      result.push(list);
    }
  });

  deltaLists.forEach((list) => {
    if (!localIds.has(list.id) && !list._deleted) {
      result.push(list);
    }
  });

  return sortByRank(result);
};

const mergeLists = (local, server) => {
  const serverMap = new Map();
  server.forEach((list) => serverMap.set(list.id, list));

  const processedServerIds = new Set();
  const result = [];

  local.forEach((localList) => {
    const serverList = serverMap.get(localList.id);
    processedServerIds.add(localList.id);

    if (localList._deleted) {
      if (serverList && !serverList._deleted) {
        const localTime = localList.updated_at ? new Date(localList.updated_at).getTime() : 0;
        const serverTime = serverList.updated_at ? new Date(serverList.updated_at).getTime() : 0;
        if (serverTime > localTime) {
          result.push(serverList);
        }
      }
      return;
    }

    if (!serverList) {
      result.push(localList);
    } else {
      const localTime = localList.updated_at ? new Date(localList.updated_at).getTime() : 0;
      const serverTime = serverList.updated_at ? new Date(serverList.updated_at).getTime() : 0;
      const winner = localTime >= serverTime ? localList : serverList;
      if (winner._deleted) return;
      result.push(winner);
    }
  });

  server.forEach((serverList) => {
    if (!processedServerIds.has(serverList.id) && !serverList._deleted) {
      result.push(serverList);
    }
  });

  return sortByRank(result);
};

const ensureMinAnimation = async (startTime) => {
  const elapsed = Date.now() - startTime;
  const remaining = MIN_SYNC_ANIMATION_MS - elapsed;
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
};

/**
 * Clean up soft-deleted lists older than 7 days.
 */
export const cleanupDeletedLists = () => {
  const lists = JSON.parse(localStorage.getItem("owb.lists")) || [];
  const now = Date.now();

  const cleaned = lists.filter((list) => {
    if (!list._deleted) return true;
    const deletedAt = list.updated_at ? new Date(list.updated_at).getTime() : 0;
    return now - deletedAt < SOFT_DELETE_RETENTION_MS;
  });

  localStorage.setItem("owb.lists", JSON.stringify(cleaned));
};

/**
 * Filter out deleted lists for display.
 */
export const filterDeletedLists = (lists) => lists.filter((l) => !l._deleted);

export const __test__ = {
  applyDelta,
  applySyncResponse,
  mergeLists,
  splitDirtyLists,
  getDirtyIds,
};

// Redux imports needed for dispatch-based functions
import { updateLogin } from "../state/login";
import { updateSetting, setSettings } from "../state/settings";
import { setLists } from "../state/lists";
