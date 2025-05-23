import { Button } from "antd";
import { BsTranslate } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../store/config/redux";
import { setTheme } from "../store/themeSlice";

const LanguageSwitcher = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  return (
    <Button
      className="language-switcher"
      onClick={toggleTheme}
      icon={theme === "light" ? <BsTranslate /> : <BsTranslate />}
    />
  );
};

export default LanguageSwitcher;
