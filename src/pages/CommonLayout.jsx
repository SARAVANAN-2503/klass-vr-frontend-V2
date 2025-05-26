import { Layout, Menu, Tooltip } from "antd";
import lightLogo from "../assets/light_logo.svg";
import darkLogo from "../assets/dark_logo.svg";
import { useAppDispatch, useAppSelector } from "../store/config/redux";
import ThemeSwitcher from "../utils/ThemeSwitcher";
import SidebarIcons from "../components/SidebarIcons";
import { setSelectedMenu } from "../store/themeSlice";
import { Link } from "react-router-dom";
import UserDetailsCard from "../components/UserDetailsCard";
import { useSelector } from "react-redux";
import { DesktopOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const { Sider } = Layout;

const CommonLayout = ({ children }) => {
  const dispatch = useAppDispatch();
  const Roles = useSelector((state) => state.auth.auth.role);
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const selectedMenu = useAppSelector((state) => state.theme.selectedMenu);
  const isCollapsed = useAppSelector((state) => state.auth.isCollapsed);
  const user = useAppSelector((state) => state.auth.auth);
  const setSidebarIcon = (path, parent = false) => {
    const isSelected = selectedMenu === path;

    if (selectedTheme == "light") {
      return (
        <SidebarIcons
          path={path}
          fill={isSelected || parent ? "#fff" : "#000"}
        />
      );
    } else {
      return (
        <SidebarIcons
          path={path}
          fill={isSelected || parent ? "gradient" : "#fff"}
        />
      );
    }
  };
  // Menu items with dynamic routing and icons

  const getMenuItems = () => {
    switch (Roles) {
      case "teacher":
        return [
          {
            key: "/",
            icon: setSidebarIcon("/"),
            label: <Link to="/teacherDashboard">Dashboard</Link>,
          },
          {
            key: "/experience",
            icon: setSidebarIcon("/experience"),
            label: <Link to="/experience">Experience</Link>,
          },
          {
            key: "/myexperience",
            icon: setSidebarIcon("/myexperience"),
            label: <Link to="/myexperience">My Experience</Link>,
          },
          {
            key: "/experienceList",
            icon: setSidebarIcon("/experienceList"),
            label: <Link to="/experienceList">Experience Report</Link>,
          },
          {
            key: "/content_repo",
            icon: setSidebarIcon("/content_repo"),
            label: <Link to="/content_repo">Content Repository</Link>,
          },
        ];
      case "systemadmin":
        return [
          {
            key: "/",
            icon: setSidebarIcon("/"),
            label: <Link to="/dashboard">Dashboard</Link>,
          },
          {
            key: "/system_client",
            icon: setSidebarIcon("/system_client"),
            label: <Link to="/client">Client</Link>,
          },
          {
            key: "/system_subscription",
            icon: setSidebarIcon("/system_subscription"),
            label: <Link to="/subscription">Subscription</Link>,
          },
          {
            key: "/experienceList",
            icon: setSidebarIcon("/experienceList"),
            label: <Link to="/roles">Roles</Link>,
          },
        ];
      case "repoManager":
        return [
          {
            key: "content_repo",
            icon: setSidebarIcon("/content_repo", true),
            label: <Link to="/content_repo">Content Repository</Link>,
          },
          // {
          //   key: "video",
          //   icon: <VideoCameraOutlined />,
          //   label: <Link to="/video">360 Video</Link>,
          // },
          // {
          //   key: "image",
          //   icon: <CameraOutlined />,
          //   label: <Link to="/image">360 Image</Link>,
          // },
          // {
          //   key: "simulation",
          //   icon: <UngroupOutlined />,
          //   label: <Link to="/simulation">Simulation</Link>,
          // },
        ];
      case "admin":
        return [
          {
            key: "/admin_management",
            icon: setSidebarIcon("/admin_management", true),
            label: <span className="ml-2">Management</span>,
            children: [
              {
                key: "/admin_device",
                icon: setSidebarIcon("/admin_device"),
                label: <Link to="/devicemanagement">Device</Link>,
              },
              {
                key: "/admin_teacher",
                icon: setSidebarIcon("/admin_teacher"),
                label: <Link to="/teachermanagement">Teacher</Link>,
              },
              {
                key: "/admin_student",
                icon: setSidebarIcon("/admin_student"),
                label: <Link to="/studentmanagement">Student</Link>,
              },
            ],
          },
        ];
      case "superadmin":
        return [
          {
            key: "_dashboard",
            icon: (
              <Link to="/_dashboard">
                <DesktopOutlined />
              </Link>
            ),
            label: <Link to="/_dashboard">Dashboard</Link>,
          },
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const menuList = getMenuItems();
    const activemenu = menuList.find(
      (item) => item?.label?.props?.to === window.location.pathname
    );
    if (activemenu) dispatch(setSelectedMenu(activemenu.key));
  }, [window.location.pathname]);

  // Handle menu item clicks
  const handleMenuClick = (e) => {
    dispatch(setSelectedMenu(e.key));
  };

  return (
    <Layout
      className={`layout-wrp ${selectedTheme} ${
        isCollapsed ? "collapsed" : "expanded"
      }`}
    >
      <ThemeSwitcher />
      {/* <LanguageSwitcher /> */}
      <div className={`sidebar-wrp ${selectedTheme}`}>
        <div className="sidebar-wrp-top">
          <div className="common_sidebar_logo">
            {/* <Tooltip
              title={selectedTheme === "light" ? "Light" : "Dark"}
              placement="top"
            > */}
            <img
              src={selectedTheme === "light" ? lightLogo : darkLogo}
              alt="logo"
            />
            {/* </Tooltip> */}
          </div>
          <Sider trigger={null} collapsible collapsed={false}>
            <Menu
              mode="inline"
              selectedKeys={[selectedMenu]}
              onClick={handleMenuClick}
              // items={menuItems}
            >
              {getMenuItems().map((item) => {
                if (item.children) {
                  return (
                    <Menu.SubMenu
                      key={item.key}
                      icon={item.icon}
                      title={item.label}
                    >
                      {item.children.map((child) => (
                        <Menu.Item key={child.key} icon={child.icon}>
                          {child.label}
                        </Menu.Item>
                      ))}
                    </Menu.SubMenu>
                  );
                } else {
                  return (
                    <Menu.Item key={item.key} icon={item.icon}>
                      {item.label}
                    </Menu.Item>
                  );
                }
              })}
            </Menu>
          </Sider>
        </div>
        {/* <div className="sidebar-user-details"> */}
        <UserDetailsCard user={user} />
        {/* </div> */}

        {/* <div className="sidebar-footer">
          <p className={selectedTheme != "dark" ? "text-black" : "text-white"}>
            Powered by Klass Reality
          </p>
        </div> */}
      </div>
      {/* Render children passed to the layout */}
      {children}
    </Layout>
  );
};

export default CommonLayout;
