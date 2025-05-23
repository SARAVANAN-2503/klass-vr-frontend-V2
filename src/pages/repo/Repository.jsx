import "./Repository.css";
import React, { useEffect, useState, useCallback } from "react";
import { DeleteModel, GetModel, GetModelImageTag, PostModel } from "../../services/Index";
import ModelViewer from "../../components/modelViewer/ModelViewer";
import {
  Card,
  Col,
  Row,
  Typography,
  Modal,
  Pagination,
  Select,
  Spin,
  Tooltip,
  Button,
  Input,
  Upload,
  Image,
  Form,
  FloatButton,
  message,
  Popconfirm,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import rightArrow from "../../assets/icons/right-arrow.svg";
import { useSelector } from "react-redux";
import subjectOptions from "../../json/subject";
import { useAppSelector } from "../../store/config/redux";

const Repository = ({ searchValue }) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.auth.auth);
  const [models, setModels] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [value, setValue] = useState({
    modelName: "",
    description: "",
    model: "",
    tags: [],
  });
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const filteredSearchValue = Object.fromEntries(Object.entries(searchValue).filter(([_, value]) => value !== ""));

      const params = {
        limit: pageSize,
        page: currentPage,
        ...(Object.keys(filteredSearchValue).length > 0 && searchValue.modelName !== "" && filteredSearchValue),
      };

      const response = await GetModel(params);
      setModels(response.results);
      setTotalResults(response.totalResults);
    } catch (error) {
      message.error("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchValue]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await GetModelImageTag();
      setTags(
        response.map((tag) => ({
          label: tag,
          value: tag,
        })),
      );
    } catch (error) {
      message.error("Failed to fetch tags");
    }
  }, []);

  useEffect(() => {
    fetchModels();
    fetchTags();
  }, [fetchModels, fetchTags, refresh]);
  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("modelFile", value.model);
    formData.append("modelName", value.modelName);
    formData.append("description", value.description);
    formData.append("tags", value.tags);
    formData.append("thumbnailFile", value.model);
    setUploading(true);
    try {
      const response = await PostModel(formData);
      form.resetFields();
      setValue({
        modelName: "",
        description: "",
        model: "",
        tags: [],
      });
      setRefresh(!refresh);
      setOpen(false);
    } catch (error) {
      message.error("Something Went Wrong");
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setOpen(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const handleSearch = (e) => {
    const { name, value } = e.target;

    setSearchValue((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleChange = (value, name) => {
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleModelClick = (model) => {
    navigate("/model-view", { state: { file: model }, replace: true });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSizeChange = (current, size) => {
    setCurrentPage(1); // Reset to the first page when changing page size
    setPageSize(size); // Update page size
  };
  const handleRemovefile = () => {
    setValue((prevValue) => ({
      ...prevValue,
      model: null, // Clear the model
      modelUrl: null, // Clear the model
      readyToUpload: false, // Reset the upload state
    }));
  };
  const handleFile = (file) => {
    setValue((prevValue) => ({
      ...prevValue,
      model: file,
      readyToUpload: true,
    }));
  };
  const handleDelete = (id) => {
    DeleteModel(id)
      .then(() => {
        setModels((prevModels) => prevModels.filter((model) => model.id !== id));
        message.success("Deleted Successfully!");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const renderModelCard = (model) => (
    <Col key={model.id} className="gutter-row" span={8}>
      <div style={{ padding: "8px 0" }}>
        <Card hoverable className="glass-effect-card">
          <ModelViewer
            modelUrl={model.modelUrl}
            _view="repository"
            style={{ width: "100%", height: "100%", focus: true }}
          />
          <Row align="flex-end" justify="space-between" style={{ padding: 10 }}>
            <Typography>{model.modelName}</Typography>
            <Row>
              <Button type="primary" size="medium" icon={<EyeOutlined />} onClick={() => handleModelClick(model)} />
              &nbsp;
              {user.role !== "teacher" && (
                <Popconfirm title="Delete this model?" onConfirm={() => handleDelete(model.id)}>
                  <Button danger type="primary" size="medium" icon={<DeleteOutlined />} />
                </Popconfirm>
              )}
            </Row>
          </Row>
        </Card>
      </div>
    </Col>
  );

  return (
    <div className="overflow-x-hidden h-full relative">
      <div className="flex gap-4">
        <Modal width={600} open={open} className="custom-close-button" onCancel={() => setOpen(false)} footer={null}>
          <Typography className="text-xl text-center pt-10">Add Model</Typography>
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
                remember: true,
                tag: "Science",
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              form={form}
            >
              <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">Model Name</Typography>
              <Form.Item
                name="modelName"
                rules={[
                  {
                    required: true,
                    message: "Please input your modelName!",
                  },
                ]}
              >
                <Input
                  className=" p-3"
                  placeholder="Please enter the modelName"
                  onChange={(e) => handleChange(e.target.value, "modelName")}
                />
              </Form.Item>
              <Typography className="text-left uppercase text-gray-500 mb-1">Tag</Typography>
              <Form.Item
                name="tags"
                rules={[
                  {
                    required: true,
                    message: "Please input your tag!",
                  },
                ]}
              >
                <Select
                  placeholder="Please enter the tags"
                  style={{
                    width: "100%",
                    height: "50px",
                  }}
                  className="custom-select-css"
                  name="tags"
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

              <Form.Item name="description" rules={[{ required: true, message: "Please Enter description!" }]}>
                <TextArea
                  className=" resize-none p-3"
                  placeholder="Please enter the description"
                  onChange={(e) => handleChange(e.target.value, "description")}
                />
              </Form.Item>
              <Typography className="text-left uppercase text-gray-500 mb-1">Upload Model</Typography>
              <div className="w-full h-30 border-dashed rounded-md flex justify-center border-gray-200 pt-5 mb-5">
                <Form.Item name="modelUrl" rules={[{ required: true, message: "Upload Model!" }]}>
                  <Upload
                    name={`modelUrl`}
                    listType="picture"
                    beforeUpload={(file) => {
                      handleFile(file);
                      return false; // Prevent automatic upload
                    }}
                    accept=".glb"
                    maxCount={1}
                    onRemove={() => handleRemovefile()}
                    fileList={value.model ? [value.model] : []}
                  >
                    <Tooltip placement="right" title="Supported Formats: .glb">
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
                  Submit <Image src={rightArrow} preview={false} alt="right arrow" />
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
      {user.role === "teacher" && (
        <div className="flex items-center justify-between">
          <span className="text-xl m-0">3D Model</span>
        </div>
      )}

      <div className="max-h-[65vh] overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center items-center w-full min-h-[80vh]">
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>{models.map(renderModelCard)}</Row>
        )}
      </div>

      <div className="flex justify-between items-center fixed bottom-[10px] w-[97%]">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalResults}
          onChange={(page) => setCurrentPage(page)}
          onShowSizeChange={(_, size) => setPageSize(size)}
          style={{ marginTop: "20px", textAlign: "center" }}
          showSizeChanger
        />

        {user.role !== "teacher" && (
          <Tooltip placement="left" title="Add Model">
            <Button type="primary" className="rounded-full" icon={<PlusOutlined />} onClick={() => setOpen(true)} />
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default Repository;
