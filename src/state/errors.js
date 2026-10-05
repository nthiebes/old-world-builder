import { createSlice } from "@reduxjs/toolkit";

export const errorSlice = createSlice({
  name: "errors",
  initialState: [],
  reducers: {
    setErrors: (state, { payload }) => {
      // Home errors (e.g. storage full) aren't list validation results, so
      // keep them when the editor replaces its validation errors.
      return [
        ...state.filter(({ section }) => section === "home"),
        ...(payload || []),
      ];
    },
    addError: (state, { payload }) => {
      return [...state, payload];
    },
    removeError: (state, { payload }) => {
      return state.filter((error) => payload !== error.message);
    },
  },
});

export const { setErrors, addError, removeError } = errorSlice.actions;

export default errorSlice.reducer;
