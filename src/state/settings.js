import { createSlice } from "@reduxjs/toolkit";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    darkMode: false,
    showPoints: true,
    showSpecialRules: true,
    showPageNumbers: false,
    showVictoryPoints: false,
    showCustomNotes: false,
    showGeneratedSpells: true,
    showStats: true,
    listSorting: "manual",
  },
  reducers: {
    setSettings: (state, { payload }) => {
      return payload || settingsSlice.initialState;
    },
    updateSetting: (state, { payload }) => ({
      ...state,
      [payload.key]: payload.value,
    }),
  },
});

export const { updateSetting, setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
