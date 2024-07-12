import { createSlice } from "@reduxjs/toolkit";

export const errorSlice = createSlice({
  name: "errors",
  initialState: [],
  reducers: {
    setErrors: (state, { payload }) => {
      return payload || [];
    },
    addError: (state, { payload }) => {
      return [...state, payload];
    },
    removeError: (state, { id }) => {
      return state.filter((error) => id !== error.id);
    },
  },
});

export const { setErrors, addError } = errorSlice.actions;

export default errorSlice.reducer;
