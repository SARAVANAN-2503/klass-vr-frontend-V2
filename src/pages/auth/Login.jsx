import Title from "antd/es/typography/Title";
import logo from "../../assets/light_logo.svg";
import { IoMailSharp } from "react-icons/io5";
import { BiSolidLock } from "react-icons/bi";
import "./Login.css";
import { Button, Form, Input, message } from "antd";
import { logout, setAuth, setIsAuthenticated, setToken } from "../../store/authSlice";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/config/redux";
import { setTheme, setSelectedMenu } from "../../store/themeSlice";
import { ForgotPassword, LoginUser, ResetPassword } from "../../services/Index";

const Login = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  useEffect(() => {
    dispatch(logout());
    dispatch(setTheme("light"));
    dispatch(setSelectedMenu("/")); // Reset selected menu on logout
  }, [dispatch]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await LoginUser(values);
      if (response?.tokens?.access?.token) {
        dispatch(setToken(response.tokens.access.token));
        dispatch(setAuth(response.user));
        dispatch(setIsAuthenticated(true));
        localStorage.setItem("accessToken", response.tokens.access.token);

        const roleRedirects = {
          systemadmin: { menu: "/", path: "/dashboard" },
          teacher: { menu: "/", path: "/teacherDashboard" },
          repoManager: { menu: "content_repo", path: "/content_repo" },
          admin: { menu: "/admin_device", path: "/devicemanagement" },
          superadmin: { menu: "_dashboard", path: "/_dashboard" },
        };

        const userRole = response.user.role;
        if (roleRedirects[userRole]) {
          const { menu, path } = roleRedirects[userRole];
          dispatch(setSelectedMenu(menu));
          navigate(path, { replace: true });
        }
      } else {
        throw new Error(response?.response?.data?.message || "Invalid credentials");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (values) => {
    setLoading(true);
    ForgotPassword({ email: values.email })
      .then((res) => {
        message.success("Password reset link sent to your email");
        setIsForgotPassword(false);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        message.error(err.response.data.message);
      });
  };

  const handleResetPassword = (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    const data = {
      password: values.password,
    };
    ResetPassword(token, data)
      .then((res) => {
        message.success("Password reset successfully");
        setIsResetPassword(false);
        navigate("/login", { replace: true });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        message.error("Failed to reset password");
      });
  };
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) {
      setToken(token);
      setIsResetPassword(true);
    }
  }, [location.search]);

  return (
    <div className="login_container">
      <div className="login_wrp">
        <div className="login_form_wrp">
          <img src={logo} alt="logo" />
          <div className="text-left leading-tight w-full">
            <h1 className="text-[30px] m-0 font-[700] login-header-text">
              EXPERIENCE<span className="text-[#7082ff]">.</span>
            </h1>
            <h1 className="text-[30px] m-0 font-[700] login-header-text">
              ENGAGE<span className="text-[#e368ef]">.</span>
            </h1>
            <h1 className="text-[30px] m-0 font-[700] login-header-text">
              LEARN<span className="text-[#fd6089]">.</span>
            </h1>
            <p className="text-[9px] font-bold uppercase m-0 mt-1 text-gray-700">
              Empowering Education through Immersive Learning
            </p>
          </div>
          {isResetPassword ? (
            <Form
              name="reset_password"
              wrapperCol={{
                span: 24,
              }}
              onFinish={handleResetPassword}
              autoComplete="off"
              className="mt-8"
            >
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters",
                  },
                  {
                    pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}|:"<>?])(?=.*\d).+$/,
                    message: "Password must contain at least one uppercase letter, one symbol, and one number",
                  },
                ]}
              >
                <Input.Password
                size="small"
                  prefix={<LockOutlined className="site-form-item-icon p-3" />}
                  placeholder="New password"
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Please confirm your new password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("The passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                size="small"
                  prefix={<LockOutlined className="site-form-item-icon p-3" />}
                  placeholder="Confirm new password"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  className="custom"
                  size="small"
                  style={{ width: "100%" }}
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
          ) : isForgotPassword ? (
            <Form
              name="forgot_password"
              wrapperCol={{
                span: 24,
              }}
              onFinish={handleForgotPassword}
              autoComplete="off"
              className="mt-8"
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input size="small" prefix={<UserOutlined className="site-form-item-icon p-3" />} placeholder="user@example.com" />
              </Form.Item>
              <Button size="small" className="custom" type="link" onClick={() => setIsForgotPassword(false)}>
                Back to Login
              </Button>
              <Form.Item>
                <Button
                  className="custom"
                  size="large"
                  style={{ width: "100%" }}
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Form layout="vertical" className="login_form" onFinish={onFinish}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your Email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
                validateTrigger="onBlur"
                style={{marginBottom:"10px"}}
              >
                <Input
                  className="custom"
                  size="large"
                  prefix={<IoMailSharp />}
                  placeholder="Email"
                  autoComplete="off"
                />
              </Form.Item>
              <Form.Item style={{marginBottom:"10px"}} name="password" rules={[{ required: true, message: "Please input your Password!" }]}>
                <Input.Password
                  className="custom"
                  size="large"
                  prefix={<BiSolidLock />}
                  placeholder="Password"
                  autoComplete="off"
                />
              </Form.Item>
              <Form.Item style={{marginBottom:"10px"}}>
                <Button className="custom" type="link" onClick={() => setIsForgotPassword(true)}>
                  Forgot Password?
                </Button>
              </Form.Item>
              <Form.Item style={{marginBottom:"10px"}}>
                <Button
                  className="custom"
                  size="large"
                  style={{ width: "100%" }}
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          )}
          <div className="w-full flex flex-col items-center justify-center mt-8">
            <p className="font-bold text-center w-full text-[9px] m-0 mt-1 text-gray-700">Powered By</p>
            <div className="login_logo" />
          </div>
        </div>
        <div className="login_banner_wrp">
          <div className="login_banner" />
        </div>
      </div>
    </div>
  );
};

export default Login;
