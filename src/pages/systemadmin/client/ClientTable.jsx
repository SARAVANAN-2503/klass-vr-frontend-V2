import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FolderViewOutlined,
  FundViewOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  ConfigProvider,
  Drawer,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import PropTypes from "prop-types";
import EditClient from "./EditClient";
import ViewClient from "./ViewClient";
import { DeleteTeacher, PatchTeacher, PatchSchool, PostUser } from "../../../services/Index";
import { useState, useEffect } from "react";
import inactive_device from "../../../assets/icons/inactive_device.svg";
import active_device from "../../../assets/icons/active_device.svg";
import edit from "../../../assets/icons/edit.svg";

import { useAppSelector } from "../../../store/config/redux";
import { GrEdit } from "react-icons/gr";
import ThemeConfig from "../../../utils/ThemeConfig";

const ClientTable = ({ data, loading, handleDelete, subscriptions, handleRefresh }) => {
  const [showSecretMap, setShowSecretMap] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [loading1, setLoading] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    setExpandedRowKeys([]);
  }, [data]);

  const handleEditSubmit = async (values) => {
    const { name, useremail, password, role } = values;
    const userData = {
      name,
      email: useremail,
      password: password,
      role,
    };

    try {
      await PatchTeacher(editUserData._id, userData);
      message.success("User updated successfully!");
      handleRefresh();
      handleCloseEditDrawer();
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Failed to update user!");
    }
  };
  const handleUserSubmit = async (values) => {
    setLoading(true);
    const { name, useremail, password, role } = values;
    const userData = {
      schoolId: schoolId,
      name: name,
      email: useremail,
      password: password,
      role: role,
    };

    try {
      await PostUser(userData);
      message.success("User updated successfully!");
      handleRefresh();
      form1.resetFields();
      setLoading(false);
      setSchoolId(null);
      setCreateUserOpen(false);
      handleCloseEditDrawer();
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.message);
    }
  };

  const handleStatus = async (record, checked) => {
    const data = { isActive: checked };

    try {
      await PatchSchool(record._id, data);
      message.success("School updated successfully!");
      handleRefresh();
    } catch (error) {
      console.error("Error updating school:", error);
      message.error("Failed to update school status!");
    }
  };

  const handleToggleSecret = (recordId) => {
    setShowSecretMap((prevState) => ({
      ...prevState,
      [recordId]: !prevState[recordId],
    }));
  };

  const handleEdit = (record) => {
    setEditUserData(record);
    form.setFieldsValue({
      name: record.name,
      useremail: record.email,
      role: record.role,
    });
    setEditDrawerVisible(true);
  };

  const handleCloseEditDrawer = () => {
    setEditUserData(null);
    form.resetFields();
    setEditDrawerVisible(false);
  };
  const handleCloseDrawer = () => {
    form1.resetFields();
    setSchoolId(null);
    setCreateUserOpen(false);
  };

  const handleUserDelete = async (record) => {
    try {
      await DeleteTeacher(record);
      message.success("User deleted successfully!");
      handleRefresh();
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user!");
    }
  };

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "User Role",
        dataIndex: "role",
        key: "role",
      },
      {
        title: "User Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "User Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Action",
        key: "id",
        align: "center",
        fixed: "right",
        render: (text, record) => (
          <Flex wrap="wrap" gap="small" justify="center">
            <Tooltip title="Edit">
              <Button
                type="primary"
                className="bg-transparent shadow-none"
                icon={<GrEdit className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure delÏete this Client?"
              onConfirm={() => handleUserDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                className="bg-transparent shadow-none"
                icon={<DeleteOutlined className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
              />
            </Popconfirm>
          </Flex>
        ),
      },
    ];

    const filteredUsers = record.users.filter((user) => user.role !== "teacher");
    return (
      <Table
        rowClassName={() => "rowClassName1"}
        columns={columns}
        dataSource={filteredUsers}
        pagination={false}
        rowKey="email"
      />
    );
  };
  const handleOpen = (record) => {
    setSchoolId(record);
    setCreateUserOpen(true);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "schoolName",
      key: "schoolName",
      sorter: (a, b) => a.schoolName.localeCompare(b.schoolName),
    },
    {
      title: "Email",
      dataIndex: "schoolEmail",
      key: "schoolEmail",
      sorter: (a, b) => a.schoolEmail.localeCompare(b.schoolEmail),
    },
    {
      title: "Phone Number",
      dataIndex: "schoolPhoneNumber",
      key: "schoolPhoneNumber",
      sorter: (a, b) => a.schoolPhoneNumber.localeCompare(b.schoolPhoneNumber),
    },
    {
      title: "Device Code",
      dataIndex: "vrDeviceRegisterSecret",
      key: "vrDeviceRegisterSecret",
      align: "left",
      render: (text, record) => (
        <div>
          {showSecretMap[record._id] ? (
            <>
              <span>{record.vrDeviceRegisterSecret}</span>
              <Button type="link" onClick={() => handleToggleSecret(record._id)}>
                Hide
              </Button>
            </>
          ) : (
            <Button type="link" onClick={() => handleToggleSecret(record._id)}>
              Show Code
            </Button>
          )}
        </div>
      ),
    },
    {
      title: "Max Allowed Device",
      dataIndex: "maxAllowedDevice",
      key: "maxAllowedDevice",
      align: "left",
      sorter: (a, b) => b.maxAllowedDevice - a.maxAllowedDevice,
    },
    {
      title: "Active status",
      dataIndex: "Expired",
      key: "Expired",
      align: "left",
      render: (text, record) =>
        !record.isSubscribed ? (
          <Image src={inactive_device} className="p-0 m-0" preview={false} />
        ) : (
          <Image src={active_device} className="p-0 m-0" preview={false} />
        ),
    },
    // {
    //   title: "Type",
    //   dataIndex: "schoolType",
    //   key: "schoolType",
    //   sorter: (a, b) => a.schoolType.localeCompare(b.schoolType),
    // },
    // {
    //   title: "Subscription Remaining Days",
    //   dataIndex: "subscriptionRemainingDays",
    //   key: "subscriptionRemainingDays",
    //   sorter: (a, b) =>
    //     b.subscriptionRemainingDays - a.subscriptionRemainingDays,
    // },
    // {
    //   title: "Status",
    //   key: "isActive",
    //   align: "left",
    //   render: (text, record) => (
    //     <Switch
    //       checked={record.isActive}
    //       onChange={(checked) => handleStatus(record, checked)}
    //     />
    //   ),
    // },
    {
      title: "Action",
      key: "id",
      align: "center",
      // fixed: "right",
      render: (text, record) => (
        <Flex wrap="wrap" gap="small" justify="center">
          {/* <Tooltip title="Actions"> */}
          <div className="flex gap-2">
            <Button
              type="primary"
              className="bg-transparent shadow-none"
              onClick={() => handleOpen(record._id)}
              icon={<UserAddOutlined className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
            />
            <ViewClient data={record} handleRefresh={handleRefresh} />
            <EditClient data={record} subscriptions={subscriptions} handleRefresh={handleRefresh} />
            <Popconfirm
              title="Are you sure delete this Client?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                className="bg-transparent shadow-none"
                icon={<DeleteOutlined className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
              />
            </Popconfirm>

            {/* <ViewClient
                className="text-black"
                data={record}
                handleRefresh={handleRefresh}
              />
              <EditClient
                data={record}
                subscriptions={subscriptions}
                handleRefresh={handleRefresh}
              /> */}
          </div>
          {/* </Tooltip> */}
        </Flex>
      ),
    },
  ];

  const handleExpand = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record._id] : []);
  };
  const handleUserInputChange = (index, name, value) => {
    const updatedUsers = [...users];
    updatedUsers[index] = {
      ...updatedUsers[index],
      [name]: value,
    };
    setUsers(updatedUsers);
  };

  return (
    <>
      <Table
        rowClassName={() => "rowClassName1"}
        loading={loading}
        className="mt-7"
        columns={columns}
        expandedRowRender={expandedRowRender}
        dataSource={data}
        expandedRowKeys={expandedRowKeys}
        onExpand={handleExpand}
        rowKey="_id"
        scroll={{ x: 1200 }}
        pagination={{
          position: ["bottomCenter"],
        }}
      />
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal
          width={600}
          centered
          className="m-[2%]"
          onCancel={handleCloseEditDrawer}
          visible={editDrawerVisible}
          destroyOnClose
          footer={false}
        >
          <Typography className="text-2xl text-[#2F3597] font-semibold text-center py-7 ">Edit User</Typography>
          <div className="flex justify-center">
            <Form
              form={form}
              layout="vertical"
              className="w-[536px]"
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              onFinish={handleEditSubmit}
            >
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                User Name
              </Typography>
              <Form.Item
                name="name"
                initialValue={editUserData?.name}
                rules={[{ required: true, message: "Please enter user name" }]}
              >
                <Input className="bg-white p-3 text-black" placeholder="Enter user name" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                User Email
              </Typography>
              <Form.Item
                name="useremail"
                initialValue={editUserData?.email}
                rules={[
                  { required: true, message: "Please enter user email" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input className="bg-white p-3 text-black" placeholder="Enter user email" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                Password
              </Typography>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: false,
                    message: "Enter a password",
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
                <Input.Password className="bg-white p-3 text-black" placeholder="Password" />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >
                <div className="flex gap-2 my-5">
                  <Button onClick={handleCloseEditDrawer}>Cancel</Button>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>
        <Modal
          width={600}
          centered
          className="m-[2%]"
          onCancel={handleCloseDrawer}
          open={createUserOpen}
          footer={false}
          destroyOnClose
        >
          <Typography className="text-2xl text-[#2F3597] font-semibold text-center py-7 ">Create User</Typography>
          <div className="flex justify-center">
            <Form
              form={form1}
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              layout="vertical"
              className="w-[536px]"
              onFinish={handleUserSubmit}
            >
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">Role</Typography>
              <Form.Item name="role" rules={[{ required: true, message: "Select a role" }]}>
                <Select
                  className="h-[50px]"
                  placeholder="Select a role"
                  onChange={(value) => handleUserInputChange(0, "role", value)}
                >
                  <Option value="superadmin" disabled={users.filter((user) => user.role === "superadmin").length >= 1}>
                    <span
                      style={{
                        color: selectedTheme === "dark" ? "white" : "black",
                      }}
                    >
                      Super Admin
                    </span>
                  </Option>
                  <Option value="admin" disabled={users.filter((user) => user.role === "admin").length >= 3}>
                    <span
                      style={{
                        color: selectedTheme === "dark" ? "white" : "black",
                      }}
                    >
                      Admin
                    </span>
                  </Option>
                </Select>
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                User Name
              </Typography>
              <Form.Item
                name="name"
                initialValue={editUserData?.name}
                rules={[{ required: true, message: "Please enter user name" }]}
              >
                <Input className="bg-white p-3 text-black" placeholder="Enter user name" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                User Email
              </Typography>
              <Form.Item
                name="useremail"
                initialValue={editUserData?.email}
                rules={[
                  { required: true, message: "Please enter user email" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input className="bg-white p-3 text-black" placeholder="Enter user email" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                Password
              </Typography>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Enter a password",
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
                <Input.Password className="bg-white p-3 text-black" placeholder="Password" />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                Confirm Password
              </Typography>
              <Form.Item
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("The new password that you entered do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password className="bg-white p-3 text-black" />
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >
                <div className="flex gap-2 my-5">
                  <Button style={{ marginLeft: 8 }} onClick={handleCloseDrawer}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading1}>
                    Submit
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </ConfigProvider>
    </>
  );
};

ClientTable.propTypes = {
  data: PropTypes.array.isRequired,
  handleRefresh: PropTypes.func,
  loading: PropTypes.bool,
  handleDelete: PropTypes.func,
};

export default ClientTable;
