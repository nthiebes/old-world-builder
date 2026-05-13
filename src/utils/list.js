import { markDirty, pushToOWR } from "./owr-sync";

const hasMeaningfulListChange = (current, next) => {
  const { updated_at: _a, ...currentRest } = current || {};
  const { updated_at: _b, ...nextRest } = next || {};
  return JSON.stringify(currentRest) !== JSON.stringify(nextRest);
};

export const updateLocalList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  if (!localLists || !updatedList) return;

  const current = localLists.find((list) => list.id === updatedList.id);
  if (!current) return;

  const merged = { ...current, ...updatedList };
  if (!hasMeaningfulListChange(current, merged)) return;

  const next = { ...merged, updated_at: new Date().toISOString() };
  const updatedLists = localLists.map((list) =>
    list.id === next.id ? next : list,
  );

  try {
    localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
    markDirty(next.id);
    pushToOWR();
  } catch (error) {}
};

export const makeTombstone = (listId) => ({
  id: listId,
  _deleted: true,
  updated_at: new Date().toISOString(),
});

export const removeFromLocalList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  const updatedLists = localLists.map((list) =>
    list.id === listId ? makeTombstone(listId) : list,
  );

  localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
  markDirty(listId);
  pushToOWR();
};
