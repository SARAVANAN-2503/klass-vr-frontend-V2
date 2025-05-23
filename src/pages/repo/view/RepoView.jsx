import React, { useState } from "react";
import { Button, Card, Col, Descriptions, Modal, Row, Typography, Input, Select, Form } from "antd";
import ModelViewer from "../../../components/modelViewer/ModelViewer";
import { PatchModel } from "../../../services/Index";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { ArrowLeftOutlined } from "@ant-design/icons";
import subjectOptions from "../../../json/subject";
import ContentWrapper from "../../../components/ContentWrapper";
import { useSelector } from "react-redux";
import { useAppSelector } from "../../../store/config/redux";

const RepoView = () => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.auth.auth);
  const {
    state: { file },
  } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState({
    id: file.id,
    modelName: file.modelName,
    description: file.description,
    tags: file.tags,
  });

  const goBack = () => {
    navigate("/content_repo", { replace: true });
  };

  const handleChange = (value, name) => {
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onFinish = async (values) => {
    setUploading(true);
    try {
      const data = {
        modelName: values.modelName,
        description: values.description,
        tags: values.tags,
      };
      await PatchModel(value.id, data);
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ContentWrapper
      header={value.modelName + " Model"}
      extra={
        <div className="flex gap-3 items-center">
          <Button icon={<ArrowLeftOutlined />} type="primary" onClick={goBack}>
            Back
          </Button>
        </div>
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <ModelViewer
              modelUrl={file.modelUrl}
              style={{
                width: "100%",
                height: "100%",
                focus: true,
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="h-full">
            <Descriptions>
              <Descriptions.Item label="Model Name">{value.modelName}</Descriptions.Item>
            </Descriptions>
            <Descriptions>
              <Descriptions.Item label="Tag">{value.tags}</Descriptions.Item>
            </Descriptions>
            <Descriptions>
              <Descriptions.Item label="Description">{value.description}</Descriptions.Item>
            </Descriptions>
            {user.role !== "teacher" && (
              <div className="flex justify-start">
                <Button type="primary" onClick={() => setOpen(true)}>
                  Edit
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal width={600} className="custom-close-button" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Typography className="text-xl text-center pt-10">Edit Model</Typography>
        <div className="flex justify-center">
          <Form
            form={form}
            className="w-[536px]"
            name="basic"
            labelCol={{
              span: 24,
            }}
            wrapperCol={{
              span: 24,
            }}
            style={{ maxWidth: 600 }}
            initialValues={{
              modelName: value.modelName || "",
              tags: value.tags || [],
              description: value.description || "",
            }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">Model Name</Typography>
            <Form.Item name="modelName" rules={[{ required: true, message: "Please input model name" }]}>
              <Input
                className=" p-3"
                placeholder="Enter model name"
                onChange={(e) => handleChange(e.target.value, "modelName")}
              />
            </Form.Item>
            <Typography className="text-left uppercase text-gray-500 mb-1">Tag</Typography>
            <Form.Item name="tags" rules={[{ required: true, message: "Please input tags" }]}>
              <Select
                placeholder="Enter tags"
                style={{
                  width: "100%",
                  height: "50px",
                }}
                onChange={(value) => handleChange(value, "tags")}
              >
                {subjectOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    <span
                      style={{
                        color: selectedTheme === "dark" ? "white" : "black",
                      }}
                    >
                      {option.label}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Typography className="text-left uppercase text-gray-500 mb-1">Description</Typography>
            <Form.Item name="description" rules={[{ required: true, message: "Please enter description" }]}>
              <TextArea
                className=" p-3"
                placeholder="Enter description"
                onChange={(e) => handleChange(e.target.value, "description")}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </ContentWrapper>
  );
};

export default RepoView;
