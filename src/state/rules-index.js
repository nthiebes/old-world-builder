import { createSlice } from "@reduxjs/toolkit";

export const rulesIndexSlice = createSlice({
  name: "rulesIndex",
  initialState: {
    activeRule: null,
    open: false,
  },
  reducers: {
    openRulesIndex: (state, { payload }) => {
      return { ...state, activeRule: payload.activeRule, open: true };
    },
    closeRulesIndex: (state) => {
      return { ...state, activeRule: null, open: false };
    },
  },
});

export const { openRulesIndex, closeRulesIndex } = rulesIndexSlice.actions;

export default rulesIndexSlice.reducer;
