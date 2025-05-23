import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import ThemeConfig from "./utils/ThemeConfig.js";
import { useAppSelector } from "./store/config/redux";
import { useEffect } from "react";

// 👉 Import MUI Date Adapter & LocalizationProvider
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const ThemedApp = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    document.body.classList.forEach((className) => {
      if (className.startsWith("layout-wrp-")) {
        document.body.classList.remove(className);
      }
    });
    document.body.classList.add(`layout-wrp-${theme}`);
  }, [theme]);

  return (
    <ConfigProvider theme={ThemeConfig[theme]}>
      <App />
    </ConfigProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemedApp />
    </LocalizationProvider>
  </Provider>
);
