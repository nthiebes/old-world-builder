import { createSlice } from "@reduxjs/toolkit";

export const errorSlice = createSlice({
  name: "errors",
  initialState: [],
  reducers: {
    addError: (state, { payload }) => {
      return [...state, payload];
    },
  },
});

export const { addError } = errorSlice.actions;

export default errorSlice.reducer;
