import { createSlice } from "@reduxjs/toolkit";

export const admin = createSlice({
  name: "admin",
  initialState: {
    accessToken: window.localStorage.getItem("accessToken") || null,
    refreshToken: window.localStorage.getItem("refreshToken")|| null,
    user: window.localStorage.getItem("user")|| null,
  },
  reducers: {
    accessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    refreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    user: (state, action) => {
      state.user = action.payload;
    },
    resetUserData: (state) => {
      // Reset the state to the initial state
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;

      // Clear local storage
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("user");

    },
  },
});

export const { accessToken, refreshToken, user, resetUserData } = admin.actions;

export default admin.reducer;
