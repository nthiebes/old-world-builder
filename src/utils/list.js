// Merges `updatedList` into the existing localStorage entry rather than
// replacing it — partial updates (e.g. folder toggle passing only id/open)
// would otherwise wipe rank/folder/units.
export const updateLocalList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  if (!localLists || !updatedList) return;

  const updatedLists = localLists.map((list) =>
    list.id === updatedList.id ? { ...list, ...updatedList } : list,
  );

  try {
    localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
  } catch (error) {}
};

export const removeFromLocalList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  const updatedLists = localLists.filter((list) => list.id !== listId);

  localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
};
