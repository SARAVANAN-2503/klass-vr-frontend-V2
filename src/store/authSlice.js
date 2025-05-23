import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  auth: null,
  token: null,
  isAuthenticated: false,
  isCollapsed: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.auth = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      sessionStorage.setItem("accessToken", action.payload);
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setIsCollapsed: (state, action) => {
      state.isCollapsed = action.payload;
    },
    logout: (state) => {
      state.auth = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, setToken, setIsAuthenticated, setIsCollapsed, logout } = authSlice.actions;
export default authSlice.reducer;