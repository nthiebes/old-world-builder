import { createSlice } from "@reduxjs/toolkit";

export const itemsSlice = createSlice({
  name: "army",
  initialState: null,
  reducers: {
    setItems: (state, { payload }) => {
      return payload;
    },
  },
});

export const { setItems } = itemsSlice.actions;

export default itemsSlice.reducer;
