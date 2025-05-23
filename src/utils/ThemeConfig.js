import { theme } from "antd";

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#9A4BFF",
    borderRadius: 10,
    sidebarBg: "#fff",
  },
  components: {
    Button: {
      colorPrimary: "#9A4BFF",
      algorithm: true,
      colorText: "#000",
    },
    Input: {
      colorBgContainer: "rgb(0,0,0,5%)",
    },
    Card: {
      colorBgContainer: "#FFFFFF",
    },
    Layout: {
      algorithm: true,
    },
  },
};

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#9A4BFF",
    borderRadius: 10,
    sidebarBg: "rgb(20, 20, 20)",
  },
  components: {
    Button: {
      colorPrimary: "#9A4BFF",
      algorithm: true,
      colorText: "#FEFEFF",
    },
    Input: {
      colorBgContainer: "rgb(255,255,255,16%)",
    },
    Card: {
      colorBgContainer: "#000",
    },
    Layout: {
      algorithm: true,
    },
  },
};

const ThemeConfig = {
  light: lightTheme,
  dark: darkTheme,
};

export default ThemeConfig;
