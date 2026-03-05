import { createSlice } from "@reduxjs/toolkit";

export const loginSlice = createSlice({
  name: "login",
  initialState: {
    loggedIn: false,
    loginLoading: true,
    loginError: false,
    isSyncing: false,
    syncConflict: false,
    syncError: false,
  },
  reducers: {
    updateLogin: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    },
  },
});

export const { updateLogin } = loginSlice.actions;

export default loginSlice.reducer;
