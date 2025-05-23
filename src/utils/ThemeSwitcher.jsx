import { Button } from "antd";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../store/config/redux";
import { setTheme } from "../store/themeSlice";

const ThemeSwitcher = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  return (
    <Button
      className="theme-switcher p-5"
      onClick={toggleTheme}
      icon={theme === "light" ? <MdDarkMode style={{ fontSize: "20px" }}/> : <MdLightMode style={{ fontSize: "20px" }}/>} 
    />
  );
};

export default ThemeSwitcher;
