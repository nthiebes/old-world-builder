import { createSlice } from "@reduxjs/toolkit";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    darkMode: false,
  },
  reducers: {
    setDarkMode: (state, { payload }) => {
      return {
        ...state,
        darkMode: payload,
      };
    },
  },
});

export const { setDarkMode } = settingsSlice.actions;

export default settingsSlice.reducer;
