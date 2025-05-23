import { useEffect, useState } from "react";
import { DeleteFilled, PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  message,
  InputNumber,
  Card,
  Modal,
  Typography,
  ConfigProvider,
} from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CreateSchool } from "../../../services/Index";
import { useAppSelector } from "../../../store/config/redux";
import ThemeConfig from "../../../utils/ThemeConfig";

const { Option } = Select;

const AddClient = ({
  showDrawer,
  onClose,
  form,
  open,
  handleRefresh,
  subscriptions,
}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // Initialize users as an empty array
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolType: "",
    gradeLevelsServed: "",
    schoolDistrict: "",
    schoolIdentificationNumber: "",
    schoolEmail: "",
    schoolPhoneNumber: "",
    maxAllowedDevice: "",
    subscriptionId: "",
    users: [],
  });
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const handleUserInputChange = (index, name, value) => {
    const updatedUsers = [...users];
    updatedUsers[index] = {
      ...updatedUsers[index],
      [name]: value,
    };
    setUsers(updatedUsers);
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Filter out empty user objects from users array
    const filteredUsers = users.filter(
      (user) =>
        user.name !== "" &&
        user.email !== "" &&
        user.password !== "" &&
        user.role !== ""
    );

    // Validate the number of super admins and admins
    const superAdminCount = filteredUsers.filter(
      (user) => user.role === "superadmin"
    ).length;
    const adminCount = filteredUsers.filter(
      (user) => user.role === "admin"
    ).length;

    if (superAdminCount > 1) {
      message.error("Only one Super Admin is allowed.");
      setLoading(false);
      return;
    }

    if (adminCount > 3) {
      message.error("Only up to three Admins are allowed.");
      setLoading(false);
      return;
    }

    // Validate for duplicate emails
    const emails = filteredUsers.map((user) => user.email);
    const duplicateEmails = emails.filter(
      (email, index) => emails.indexOf(email) !== index
    );

    if (duplicateEmails.length > 0) {
      message.error(
        `Duplicate user emails are not allowed: ${[
          ...new Set(duplicateEmails),
        ].join(", ")}`
      );
      setLoading(false);
      return;
    }

    const formDataToSend = {
      ...formData,
      users: filteredUsers.map((user) => ({
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
      })),
    };

    try {
      const res = await CreateSchool(formDataToSend);

      if (res.code === 409) {
        message.warning(res.message);
      } else {
        message.success("School created successfully!");

        // Reset form data and UI state
        setFormData({
          schoolName: "",
          schoolAddress: "",
          maxAllowedDevice: "",
          schoolType: "",
          gradeLevelsServed: "",
          schoolDistrict: "",
          schoolIdentificationNumber: "",
          schoolEmail: "",
          schoolPhoneNumber: "",
          subscriptionId: "",
          users: [],
        });
        handleRefresh();
        form.resetFields();
        onClose();
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to create school");
    } finally {
      setLoading(false); // Reset loading state whether success or error
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onFinishFailed = (errorInfo) => {
    message.error(errorInfo);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
        New Client
      </Button>
      <ConfigProvider theme={ThemeConfig.light}>
      <Modal
        onCancel={onClose}
        width={1000}
        centered 
        className="m-[2%]"
        open={open}
        footer={false}
        style={{
          paddingBottom: 80,
        }}
      >
        <Typography className="text-2xl text-[#2F3597] font-semibold text-center py-10 ">
          Create Client
        </Typography>
        <div className="flex justify-center">
          <Form
            layout="vertical"
            className="w-[885px] "
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            form={form}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School Name
                </Typography>
                <Form.Item
                  name="schoolName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter school name",
                    },
                  ]}
                >
                  <Input
                    placeholder="Please enter school name"
                    onChange={(e) =>
                      handleInputChange("schoolName", e.target.value)
                    }
                    className="bg-white p-3 text-black"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School Email
                </Typography>
                <Form.Item
                  name="schoolEmail"
                  rules={[
                    {
                      type: "email",
                      message: "The input is not a valid email!",
                    },
                    {
                      required: true,
                      message: "Please enter an email",
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (value) {
                          const validDomains = [".com", ".edu", ".org", ".in"];
                          const isValid = validDomains.some((domain) =>
                            value.toLowerCase().endsWith(domain)
                          );
                          if (!isValid) {
                            callback("Invalid email address");
                          } else {
                            callback();
                          }
                        } else {
                          callback();
                        }
                      },
                    },
                  ]}
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange("schoolEmail", e.target.value)
                    }
                    className="bg-white p-3 text-black"
                    placeholder="Please enter email"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School Type
                </Typography>
                <Form.Item
                  name="schoolType"
                  rules={[
                    {
                      required: true,
                      message: "Please select a school type",
                    },
                  ]}
                >
                  <Select
                    placeholder="Please select a school type"
                    className="h-[50px] text-black"
                    onChange={(value) => handleInputChange("schoolType", value)}
                  >
                    <Option value="Public">
                      <span
                        style={{
                          color: selectedTheme === "dark" ? "white" : "black",
                        }}
                      >
                        Public
                      </span>
                    </Option>
                    <Option value="Private">
                      <span
                        style={{
                          color: selectedTheme === "dark" ? "white" : "black",
                        }}
                      >
                        Private
                      </span>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School Subscription Name
                </Typography>
                <Form.Item
                  name="subscriptionId"
                  rules={[
                    {
                      required: true,
                      message: "Please select a subscription",
                    },
                  ]}
                >
                  <Select
                    placeholder="Please select a subscription"
                    onChange={(value) =>
                      handleInputChange("subscriptionId", value)
                    }
                    className="h-[50px]"
                  >
                    {subscriptions
                      .filter((subscription) => subscription.isActive === true)
                      .map((subscription) => (
                        <Option key={subscription._id} value={subscription._id}>
                          <span
                            style={{
                              color:
                                selectedTheme === "dark" ? "white" : "black",
                            }}
                          >
                            {subscription.name}
                          </span>
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School Phone Number
                </Typography>
                <Form.Item
                  name="schoolPhoneNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the school phone number",
                    },
                  ]}
                >
                  <InputNumber
                    style={{
                      width: "100%",
                    }}
                    onChange={(value) =>
                      handleInputChange("schoolPhoneNumber", value.toString())
                    }
                    className="bg-white p-2 text-black"
                    placeholder="Please enter phone number"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School District
                </Typography>
                <Form.Item
                  name="schoolDistrict"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the school district",
                    },
                  ]}
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange("schoolDistrict", e.target.value)
                    }
                    className="bg-white p-3 text-black"
                    placeholder="Please enter district"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  Grade Levels Served
                </Typography>
                <Form.Item
                  name="gradeLevelsServed"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the grade levels served",
                    },
                  ]}
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange("gradeLevelsServed", e.target.value)
                    }
                    className="bg-white p-3 text-black"
                    placeholder="Please enter grade levels"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School Identification Number
                </Typography>
                <Form.Item
                  name="schoolIdentificationNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the school identification number",
                    },
                  ]}
                >
                  <Input
                    onChange={(e) =>
                      handleInputChange(
                        "schoolIdentificationNumber",
                        e.target.value
                      )
                    }
                    className="bg-white p-3 text-black"
                    placeholder="Please enter school identification number"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  Device limit
                </Typography>
                <Form.Item
                  name="maxAllowedDevice"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the device limit",
                    },
                  ]}
                >
                  <InputNumber
                    style={{
                      width: "100%",
                    }}
                    onChange={(value) =>
                      handleInputChange("maxAllowedDevice", value.toString())
                    }
                    className="bg-white p-2 text-black"
                    placeholder="Please enter max allowed devices"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                  School Address
                </Typography>
                <Form.Item
                  name="schoolAddress"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the school address",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={1}
                    onChange={(e) =>
                      handleInputChange("schoolAddress", e.target.value)
                    }
                    className="bg-white p-3 h-[50px] resize-none text-black"
                    placeholder="Please enter the school address"
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* <Divider orientation="left" style={{ fontSize: "20px" }}>
              Users
            </Divider>
            <Form.List name="users">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(
                    ({ key, name, fieldKey, ...restField }, index) => (
                      <Card
                        key={key}
                        size="small"
                        className="my-5"
                        extra={
                          <DeleteFilled
                            style={{ color: "red" }}
                            onClick={() => {
                              const updatedUsers = users.filter(
                                (_, i) => i !== index
                              );
                              setUsers(updatedUsers);
                              remove(name);
                            }}
                          />
                        }
                      >
                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              label="Role"
                              {...restField}
                              name={[name, "role"]}
                              fieldKey={[fieldKey, "role"]}
                              rules={[
                                { required: true, message: "Select a role" },
                              ]}
                            >
                              <Select
                                placeholder="Select a role"
                                onChange={(value) =>
                                  handleUserInputChange(index, "role", value)
                                }
                              >
                                <Option
                                  value="superadmin"
                                  disabled={
                                    users.filter(
                                      (user) => user.role === "superadmin"
                                    ).length >= 1
                                  }
                                >
                                  Super Admin
                                </Option>
                                <Option
                                  value="admin"
                                  disabled={
                                    users.filter(
                                      (user) => user.role === "admin"
                                    ).length >= 3
                                  }
                                >
                                  Admin
                                </Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label="User Name"
                              {...restField}
                              name={[name, "name"]}
                              fieldKey={[fieldKey, "name"]}
                              rules={[
                                { required: true, message: "Enter a name" },
                              ]}
                            >
                              <Input
                                placeholder="User Name"
                                onChange={(e) =>
                                  handleUserInputChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label="User Email"
                              {...restField}
                              name={[name, "email"]}
                              fieldKey={[fieldKey, "email"]}
                              rules={[
                                {
                                  type: "email",
                                  message: "Invalid email address",
                                },
                                { required: true, message: "Enter an email" },
                              ]}
                            >
                              <Input
                                placeholder="User Email"
                                onChange={(e) =>
                                  handleUserInputChange(
                                    index,
                                    "email",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label="Password"
                              {...restField}
                              name={[name, "password"]}
                              fieldKey={[fieldKey, "password"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Enter a password",
                                },
                                {
                                  min: 8,
                                  message:
                                    "Password must be at least 8 characters",
                                },
                                {
                                  pattern:
                                    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}|:"<>?])(?=.*\d).+$/,
                                  message:
                                    "Password must contain at least one uppercase letter, one symbol, and one number",
                                },
                              ]}
                            >
                              <Input.Password
                                placeholder="Password"
                                onChange={(e) =>
                                  handleUserInputChange(
                                    index,
                                    "password",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    )
                  )}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    disabled={
                      users.filter((user) => user.role === "superadmin")
                        .length >= 1 &&
                      users.filter((user) => user.role === "admin").length >= 3
                    }
                  >
                    Add User
                  </Button>
                  <div style={{ color: "red", marginTop: 16 }}>
                    Note: Only one Super Admin and up to three Admins are
                    allowed.
                  </div>
                </>
              )}
            </Form.List> */}
            <div className="flex justify-center">
              <Form.Item className="my-7">
                <Space>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
      </ConfigProvider>
    </>
  );
};

AddClient.propTypes = {
  showDrawer: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleRefresh: PropTypes.func.isRequired,
};

export default AddClient;
