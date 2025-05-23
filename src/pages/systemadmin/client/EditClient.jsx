import React, { useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import {
  Button,
  Col,
  ConfigProvider,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetSubscription, PatchSchool } from "../../../services/Index";
import edit from "../../../assets/icons/edit.svg";
import { useAppSelector } from "../../../store/config/redux";
import { GrEdit } from "react-icons/gr";
import ThemeConfig from "../../../utils/ThemeConfig";
const { Option } = Select;

const EditClient = ({ data, handleRefresh, subscriptions }) => {
  const [editopen, setEditopen] = useState(false);
  const EditDrawer = () => {
    setEditopen(true);
  };
  const Close = () => {
    setEditopen(false);
  };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolType: "",
    gradeLevelsServed: "",
    schoolDistrict: "",
    schoolIdentificationNumber: "",
    schoolEmail: "",
    maxAllowedDevice: "",
    schoolPhoneNumber: "",
    subscriptionId: "",
  });
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    // Fetch subscriptions from API

    if (data) {
      form.setFieldsValue({
        ...formData,
        schoolName: data.schoolName,
        schoolAddress: data.schoolAddress,
        schoolType: data.schoolType,
        gradeLevelsServed: data.gradeLevelsServed,
        schoolDistrict: data.schoolDistrict,
        schoolIdentificationNumber: data.schoolIdentificationNumber,
        schoolEmail: data.schoolEmail,
        schoolPhoneNumber: data.schoolPhoneNumber,
        subscriptionId: data.subscriptionId,
        maxAllowedDevice: data.maxAllowedDevice,
      });
      setFormData({
        ...formData,
        schoolName: data.schoolName,
        schoolAddress: data.schoolAddress,
        schoolType: data.schoolType,
        gradeLevelsServed: data.gradeLevelsServed,
        schoolDistrict: data.schoolDistrict,
        schoolIdentificationNumber: data.schoolIdentificationNumber,
        schoolEmail: data.schoolEmail,
        maxAllowedDevice: data.maxAllowedDevice,
        schoolPhoneNumber: data.schoolPhoneNumber,
        subscriptionId: data.subscriptionId,
      });
    }
  }, [data]);

  const handleSubmit = () => {
    setLoading(true);

    const formDataToSend = {
      ...formData,
    };
    PatchSchool(data._id, formDataToSend)
      .then(() => {
        message.success("Client updated");
        handleRefresh();
        setLoading(false);

        Close();
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error creating client:", error);
        message.error("Error creating client");
      });
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <>
      <Button
        type="primary"
        className="bg-transparent shadow-none"
        icon={<GrEdit className={`${selectedTheme === "dark" ? "text-white" : "text-black"}`} />}
        onClick={EditDrawer}
      />
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal
          width={1000}
          onCancel={Close}
          centered
          className="m-[2%]"
          open={editopen}
          footer={false}
          styles={{
            body: {
              paddingBottom: 80,
            },
          }}
        >
          <Typography className="text-2xl text-[#2F3597] font-semibold text-center py-10 ">Create Client</Typography>
          <div className="flex justify-center">
            <Form
              layout="vertical"
              className="w-[885px] "
              name="basic"
              initialValues={{
                remember: true,
              }}
              onFinish={handleSubmit}
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
                        message: "Please enter user schoolName",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Please enter user schoolName"
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange("schoolName", e.target.value)}
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
                        message: "The input is not valid E-mail!",
                      },
                      {
                        required: true,
                        message: "Please enter email",
                      },
                      {
                        validator: (rule, value, callback) => {
                          if (value) {
                            const validDomains = [".com", ".edu", ".org", ".in"];
                            const isValid = validDomains.some((domain) => value.toLowerCase().endsWith(domain));
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
                      style={{
                        width: "100%",
                      }}
                      value={formData.schoolEmail}
                      onChange={(e) => handleInputChange("schoolEmail", e.target.value)}
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
                        message: "Please select an schoolType",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Please select an schoolType"
                      value={formData.schoolType}
                      onChange={(value) => handleInputChange("schoolType", value)}
                      className="h-[50px]"
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
                        message: "Please select an subscriptionId",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Please select a subscriptionId"
                      value={data.subscritpions ? formData.subscriptionId : ""}
                      onChange={(value) => handleInputChange("subscriptionId", value)}
                      className="h-[50px]"
                    >
                      {subscriptions.map((subscription) => (
                        <Option key={subscription._id} value={subscription._id}>
                          <span
                            style={{
                              color: selectedTheme === "dark" ? "white" : "black",
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
                        message: "Please choose the School PhoneNumber",
                      },
                    ]}
                  >
                    <Input
                      style={{
                        width: "100%",
                      }}
                      value={formData.schoolPhoneNumber}
                      onChange={(e) => handleInputChange("schoolPhoneNumber", e.target.value)}
                      className="bg-white p-2 text-black"
                      placeholder="Please enter Phone Number"
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
                        message: "Please choose the School District",
                      },
                    ]}
                  >
                    <Input
                      style={{
                        width: "100%",
                      }}
                      value={formData.schoolDistrict}
                      onChange={(e) => handleInputChange("schoolDistrict", e.target.value)}
                      className="bg-white p-2 text-black"
                      placeholder="Please enter District"
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
                        message: "Please choose the gradeLevelsServed",
                      },
                    ]}
                  >
                    <Input
                      style={{
                        width: "100%",
                      }}
                      value={formData.gradeLevelsServed}
                      onChange={(e) => handleInputChange("gradeLevelsServed", e.target.value)}
                      className="bg-white p-3 text-black"
                      placeholder="Please enter gradeLevelsServed"
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
                        message: "Please choose the schoolIdentificationNumber",
                      },
                    ]}
                  >
                    <Input
                      style={{
                        width: "100%",
                      }}
                      value={formData.schoolIdentificationNumber}
                      onChange={(e) => handleInputChange("schoolIdentificationNumber", e.target.value)}
                      className="bg-white p-3 text-black"
                      placeholder="Please enter school Identification Number"
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
                        message: "Please choose the maxAllowedDevice",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{
                        width: "100%",
                      }}
                      value={formData.maxAllowedDevice}
                      onChange={(value) => handleInputChange("maxAllowedDevice", value.toString())}
                      className="bg-white p-3 text-black"
                      placeholder="Please enter maxAllowedDevice"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Typography className="text-left text-sm uppercase text-[#9B4CFF] font-medium mt-3 mb-1">
                    School Address
                  </Typography>
                  <Form.Item
                    name="schoolAddress"
                    rules={[
                      {
                        required: true,
                        message: "please enter url schoolAddress",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      value={formData.schoolAddress}
                      onChange={(e) => handleInputChange("schoolAddress", e.target.value)}
                      className="bg-white p-3 h-[50px] resize-none text-black"
                      placeholder="please enter url schoolAddress"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-center">
                <Form.Item>
                  <Space>
                    <Button onClick={Close}>Cancel</Button>
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

EditClient.propTypes = {
  data: PropTypes.object,
  handleRefresh: PropTypes.func,
};

export default EditClient;
