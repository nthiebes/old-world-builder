import * as Sentry from "@sentry/react";

import store from "../store";
import { addError, removeError } from "../state/errors";
import { clearRuleDescriptionCache } from "./rule-descriptions";

const STORAGE_FULL_ERROR = "misc.storageFull";

const hasStorageFullError = () =>
  store.getState().errors.some(({ message }) => message === STORAGE_FULL_ERROR);

const setStorageFullError = (isFull) => {
  if (isFull && !hasStorageFullError()) {
    store.dispatch(addError({ message: STORAGE_FULL_ERROR, section: "home" }));
  } else if (!isFull && hasStorageFullError()) {
    store.dispatch(removeError(STORAGE_FULL_ERROR));
  }
};

// Saves all lists to localStorage. If the quota is exceeded, frees the rule
// description cache and retries once before showing an error on the home page.
export const saveLocalLists = (lists) => {
  const serializedLists = JSON.stringify(lists);

  try {
    localStorage.setItem("owb.lists", serializedLists);
    setStorageFullError(false);
    return true;
  } catch {
    clearRuleDescriptionCache();
  }

  try {
    localStorage.setItem("owb.lists", serializedLists);
    setStorageFullError(false);
    return true;
  } catch (error) {
    Sentry.captureException(error);
    setStorageFullError(true);
    return false;
  }
};

export const updateLocalList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));

  if (!localLists) {
    return;
  }

  saveLocalLists(
    localLists.map((list) => (list.id === updatedList.id ? updatedList : list))
  );
};

export const removeFromLocalList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));

  saveLocalLists(localLists.filter(({ id }) => listId !== id));
};

export const updateListsFolder = (lists) => {
  const folderIndexes = {};
  let latestFolderIndex = null;

  lists.forEach((folder, index) => {
    if (folder.type === "folder") {
      folderIndexes[index] = folder.id;
    }
  });

  const newLists = lists.map((list, index) => {
    if (folderIndexes[index]) {
      latestFolderIndex = index;
    }

    if (list.type === "folder") {
      return list;
    }

    return {
      ...list,
      folder:
        latestFolderIndex !== null ? folderIndexes[latestFolderIndex] : null,
    };
  });

  return newLists;
};
