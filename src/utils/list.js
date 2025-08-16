export const updateLocalList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
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
      localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
  } catch (error) {}
};

export const removeFromLocalList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  const updatedLists = localLists.filter(({ id }) => listId !== id);

  localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
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
