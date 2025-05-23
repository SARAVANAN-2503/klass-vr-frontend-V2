import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
  selectedMenu: "/",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setSelectedMenu: (state, action) => {
      state.selectedMenu = action.payload;
    },
  },
});

export const { setTheme, setSelectedMenu } = themeSlice.actions;
export default themeSlice.reducer;