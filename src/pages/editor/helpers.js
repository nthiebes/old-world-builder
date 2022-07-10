export const updateList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("lists"));
  const updatedLists = localLists.map((list) => {
    if (list.id === updatedList.id) {
      return updatedList;
    } else {
      return list;
    }
  });

  localStorage.setItem("lists", JSON.stringify(updatedLists));
};

export const removeList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("lists"));
  const updatedLists = localLists.filter(({ id }) => listId !== id);

  localStorage.setItem("lists", JSON.stringify(updatedLists));
};
