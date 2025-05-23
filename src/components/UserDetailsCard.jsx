import { Avatar, Button, ConfigProvider, Form, Image, Input, message, Modal, Tooltip, Typography, Upload } from "antd";
import { ArrowRightOutlined, ExclamationCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../store/config/redux";
import { useNavigate } from "react-router-dom";
import { logout, setAuth } from "../store/authSlice";
import { useState } from "react";
import rightArrow from "../assets/icons/right-arrow.svg";
import AvatarIcon from "../assets/icons/boy.png";
import { UpdateProfile } from "../services/Index";
import ThemeConfig from "../utils/ThemeConfig";

const UserDetailsCard = ({ user }) => {
  const navigate = useNavigate();
  const isCollapsed = useAppSelector((state) => state.auth.isCollapsed);
  const dispatch = useAppDispatch();
  const [openLogout, setOpenLogout] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [value, setValue] = useState({
    username: user.name,
    imageFile: "",
  });
  const handleConfirmLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate("/login", { replace: true });
  };
  const handleChange = (value, name) => {
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("profilePicture", value.imageFile);
    formData.append("username", values.username);
    setUploading(true);
    try {
      const response = await UpdateProfile(formData);
      form.resetFields();
      setValue({
        username: "",
      });

      // setRefresh(!refresh);
      // setOpen(false);
      dispatch(setAuth(response));
      setOpenProfile(false);
    } catch (error) {
      message.error("Something Went Wrong");
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setOpenProfile(false);
    }
  };
  const handleFile = (file) => {
    setValue((prevValue) => ({
      ...prevValue,
      imageFile: file,
      readyToUpload: true,
    }));
  };
  const handleRemovefile = () => {
    setValue((prevValue) => ({
      ...prevValue,
      username: null, // Clear the model
      imageFile: null, // Clear the model
      readyToUpload: false, // Reset the upload state
    }));
  };

  return (
    <div className="user-details-card">
      <div className="user-details-card-header">
        <Avatar
          size={64}
          onClick={() => setOpenProfile(true)}
          style={{ backgroundColor: "#FEFEFF" }}
          src={user.profilePictureURL ? user.profilePictureURL : AvatarIcon}
        />
        <div className="user-details-card-header-title">{user.role}</div>
      </div>
      <div className="user-details-card-body">
        <div className="user-details-name">
          <p>{user.name}</p>
        </div>
        {!isCollapsed && (
          <div className="user-details-email">
            <p>{user.email}</p>
          </div>
        )}
      </div>
      <div className="user-details-card-footer">
        <Button type="primary" className=" px-4 rounded-3xl" onClick={() => setOpenLogout(true)}>
          Logout <Image src={rightArrow} alt="right arrow" preview={false} />
        </Button>
      </div>
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal
          open={openProfile}
          onCancel={() => setOpenProfile(false)}
          footer={null}
          width={600}
          className="custom-close-button"
        >
          <Typography className="text-xl text-center pt-10">Update Profile</Typography>
          <div className="flex justify-center">
            <Form
              name="basic"
              className="w-[536px]"
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              initialValues={{
                username: user.name || "",
              }}
              onFinish={onFinish}
              autoComplete="off"
              form={form}
            >
              <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">User Name</Typography>
              <Form.Item name="username" rules={[{ required: true, message: "Please input your username!" }]}>
                <Input
                  className=" p-3"
                  placeholder="Please enter the username"
                  onChange={(e) => handleChange(e.target.value, "username")}
                />
              </Form.Item>
              <Typography className="text-left uppercase text-gray-500 mb-1">Upload profilePicture</Typography>
              <div className="w-full h-30 border-dashed rounded-md flex justify-center border-gray-200 pt-5 mb-5">
                <Form.Item name="imageFile" rules={[{ required: true, message: "Upload image file!" }]}>
                  <Upload
                    name={`imageFile`}
                    listType="picture"
                    beforeUpload={(file) => {
                      handleFile(file);
                      return false; // Prevent automatic upload
                    }}
                    accept=".jpeg,.jpg"
                    maxCount={1}
                    onRemove={() => handleRemovefile()}
                    fileList={value.imageFile ? [value.imageFile] : []}
                  >
                    <Tooltip placement="right" title="Supported Formats: .jpeg,.jpg">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Tooltip>
                  </Upload>
                </Form.Item>
              </div>
              <Form.Item
                wrapperCol={{
                  offset: 9,
                  span: 16,
                }}
              >
                <Button type="primary" htmlType="submit" loading={uploading} className="ml-4">
                  Update {/* <Image  preview={false} alt="right arrow" /> */}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
        <Modal
          open={openLogout}
          onCancel={() => setOpenLogout(false)}
          width={"25%"}
          footer={null}
          centered
          closable={false}
          title=""
        >
          <div className="p-4">
            <p className="font-bold text-[16px] text-center">Are you sure you want to log out?</p>
            <div style={{ marginTop: 20 }} className="text-center">
              <Button type="primary" danger onClick={handleConfirmLogout} style={{ marginRight: 10 }}>
                Log out
              </Button>
              <Button onClick={() => setOpenLogout(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default UserDetailsCard;
