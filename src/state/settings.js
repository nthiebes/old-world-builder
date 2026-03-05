import { createSlice } from "@reduxjs/toolkit";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    colorScheme: "auto",
    showPoints: true,
    showSpecialRules: true,
    showPageNumbers: false,
    showVictoryPoints: false,
    showCustomNotes: false,
    showGeneratedSpells: true,
    listSorting: "manual",
    showStats: true,
    lastChanged: null,
    lastSynced: null,
    autoSync: false,
    favorites: [],
  },
  reducers: {
    setSettings: (_, { payload }) => {
      return payload
        ? { ...settingsSlice.getInitialState(), ...payload }
        : settingsSlice.getInitialState();
    },
    updateSetting: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    },
  },
});

export const { updateSetting, setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
