import { createSlice } from "@reduxjs/toolkit";

export const armySlice = createSlice({
  name: "army",
  initialState: null,
  reducers: {
    setArmy: (state, { payload }) => {
      return payload;
    },
  },
});

export const { setArmy } = armySlice.actions;

export default armySlice.reducer;
