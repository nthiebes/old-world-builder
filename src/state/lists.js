import { createSlice } from "@reduxjs/toolkit";

import { getRandomId } from "../utils/id";

export const listsSlice = createSlice({
  name: "lists",
  initialState: [],
  reducers: {
    setLists: (state, { payload }) => {
      return payload || [];
    },
    addUnit: (state, { payload }) => {
      const { listId, type, unit } = payload;
      const newUnit = {
        ...unit,
        strength: unit.minimum,
        id: `${unit.id}.${getRandomId()}`,
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
    editUnit: (state, { payload }) => {
      const { listId, type, strength, unit } = payload;
      const newUnit = {
        ...unit,
        strength,
        id: `${unit.id}.${getRandomId()}`,
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

export const { setLists, addUnit, editUnit, removeUnit } = listsSlice.actions;

export default listsSlice.reducer;
