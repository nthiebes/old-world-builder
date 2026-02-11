export const updateLocalList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("whfb.lists"));
  const updatedLists =
    localLists &&
    localLists.map((list) => {
      if (list.id === updatedList.id) {
        return updatedList;
      } else {
        return list;
      }
    });

  try {
    localLists &&
      localStorage.setItem("whfb.lists", JSON.stringify(updatedLists));
  } catch (error) {}
};

export const removeFromLocalList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("whfb.lists"));
  const updatedLists = localLists.filter(({ id }) => listId !== id);

  localStorage.setItem("whfb.lists", JSON.stringify(updatedLists));
};

export const updateListsFolder = (lists) => {
  const folderIndexes = {};
  let latestFolderIndex = null;

  lists.forEach((folder, index) => {
    if (folder && folder.type === "folder") {
      folderIndexes[index] = folder.id;
    }
  });

  const newLists = lists.map((list, index) => {
    if (folderIndexes[index]) {
      latestFolderIndex = index;
    }

    if (!list || list.type === "folder") {
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
