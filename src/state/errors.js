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
    removeError: (state, { message }) => {
      return state.filter((error) => message !== error.message);
    },
  },
});

export const { setErrors, addError } = errorSlice.actions;

export default errorSlice.reducer;
