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

  localLists && localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
};

export const removeFromLocalList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  const updatedLists = localLists.filter(({ id }) => listId !== id);

  localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
};
