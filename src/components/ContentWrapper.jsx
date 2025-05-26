import { Layout, Tooltip } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { useAppDispatch, useAppSelector } from "../store/config/redux";
import { setIsCollapsed } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const ContentWrapper = ({
  children = "Content",
  header = "Header",
  extra = <></>,
  className = "",
  prefix = "",
  routeTo = "",
  teacher = false,
}) => {
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const isCollapsed = useAppSelector((state) => state.auth.isCollapsed);
  return (
    <Layout style={{ background: "transparent" }} className={className}>
      {!teacher && (
        <Header className={`header-wrp ml-[2%] ${selectedTheme}`}>
          <div className="header-wrp-left">
            {prefix && (
              <button
                className="text-[#fff] text-[14px] w-[30px] h-[30px] flex justify-center items-center color-[#000000] bg-[#00000057] rounded-full border-none "
                onClick={() => nav(routeTo)}
              >
                {prefix}
              </button>
            )}
            {/* <Tooltip title={isCollapsed ? "Expand the sidebar" : "Collapse the sidebar"}> */}
            <p

            // onClick={() => dispatch(setIsCollapsed(!isCollapsed))}
            >
              {header}
            </p>
            {/* <p>{header}</p> */}
            {/* </Tooltip> */}
          </div>
          <div className="header-wrp-right">{extra}</div>
        </Header>
      )}
      <Content
        style={{
          margin: "1% 1% 1% 2%",
          padding: "2%",
          minHeight: 280,
        }}
        className={`content-wrp ${selectedTheme}`}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default ContentWrapper;
