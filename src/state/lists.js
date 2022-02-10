import { createSlice } from "@reduxjs/toolkit";

export const listsSlice = createSlice({
  name: "lists",
  initialState: {
    value: [],
  },
  reducers: {
    setLists: (state, action) => {
      state.value = action.payload || [];
    },
    // incrementByAmount: (state, action) => {
    //   state.value += action.payload;
    // },
  },
});

export const { setLists } = listsSlice.actions;

export default listsSlice.reducer;
