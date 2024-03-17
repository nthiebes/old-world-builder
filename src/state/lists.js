import { createSlice } from "@reduxjs/toolkit";

import { getRandomId } from "../utils/id";
import { swap } from "../utils/collection";

export const listsSlice = createSlice({
  name: "lists",
  initialState: [],
  reducers: {
    setLists: (state, { payload }) => {
      return payload || [];
    },
    updateList: (state, { payload }) => {
      const { listId, name, points, description } = payload;
      const newValues = { name, points, description };

      Object.keys(newValues).forEach((key) =>
        newValues[key] === undefined ? delete newValues[key] : {}
      );

      return state.map((list) => {
        const { id } = list;

        if (listId === id) {
          return {
            ...list,
            ...newValues,
          };
        }

        return list;
      });
    },
    deleteList: (state, { payload }) => {
      return state.filter(({ id }) => id !== payload);
    },
    addUnit: (state, { payload }) => {
      const { listId, type, unit } = payload;
      const newUnit = {
        ...unit,
        strength: unit.minimum,
      };

      return state.map((list) => {
        const { id } = list;

        if (listId === id) {
          return {
            ...list,
            [type]: [...list[type], newUnit],
          };
        }

        return list;
      });
    },
    moveUnit: (state, { payload }) => {
      const { listId, type, sourceIndex, destinationIndex } = payload;

      return state.map((list) => {
        if (listId === list.id) {
          return {
            ...list,
            [type]: swap([...list[type]], sourceIndex, destinationIndex),
          };
        }

        return list;
      });
    },
    duplicateUnit: (state, { payload }) => {
      const { listId, type, unitId } = payload;
      const unit = state
        .find(({ id }) => id === listId)
        [type].find(({ id }) => id === unitId);

      return state.map((list) => {
        const { id } = list;

        if (listId === id) {
          return {
            ...list,
            [type]: [
              ...list[type],
              { ...unit, id: `${unit.id.split(".")[0]}.${getRandomId()}` },
            ],
          };
        }

        return list;
      });
    },
    editUnit: (state, { payload }) => {
      const {
        listId,
        type,
        strength,
        unitId,
        options,
        equipment,
        armor,
        command,
        mounts,
        magic,
        items,
        name,
        detachments,
        activeLore,
      } = payload;
      const newValues = {
        strength,
        options,
        equipment,
        armor,
        command,
        mounts,
        magic,
        items,
        detachments,
        activeLore,
        name,
      };
      const unit = state
        .find(({ id }) => id === listId)
        [type].find(({ id }) => id === unitId);

      Object.keys(newValues).forEach((key) =>
        newValues[key] === undefined ? delete newValues[key] : {}
      );

      const newUnit = {
        ...unit,
        ...newValues,
      };

      return state.map((list) => {
        const { id } = list;

        if (listId === id) {
          return {
            ...list,
            [type]: list[type].map((data) => {
              if (data.id === unit.id) {
                return newUnit;
              }
              return data;
            }),
          };
        }

        return list;
      });
    },
    removeUnit: (state, { payload }) => {
      const { listId, type, unitId } = payload;

      return state.map((list) => {
        const { id } = list;

        if (listId === id) {
          return {
            ...list,
            [type]: list[type].filter((data) => {
              if (data.id === unitId) {
                return false;
              }
              return true;
            }),
          };
        }

        return list;
      });
    },
  },
});

export const {
  setLists,
  addUnit,
  moveUnit,
  editUnit,
  removeUnit,
  duplicateUnit,
  updateList,
  deleteList,
  duplicateList,
} = listsSlice.actions;

export default listsSlice.reducer;
