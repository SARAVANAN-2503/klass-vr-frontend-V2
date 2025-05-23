import React, { useEffect, useState, useCallback } from "react";
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
  Popconfirm,
  message,
  Form,
  FloatButton,
  Image,
  ConfigProvider,
} from "antd";
import noimage from "../../../../public/no image.png";
import TextArea from "antd/es/input/TextArea";
import { DeleteImage, GetImage, GetRepoImageTag, PostImage } from "../../../services/Index";
import { DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import rightArrow from "../../../assets/icons/right-arrow.svg";
import subjectOptions from "../../../json/subject";
import { useAppSelector } from "../../../store/config/redux";
import ThemeConfig from "../../../utils/ThemeConfig";

const Image360 = ({ searchValue }) => {
  const user = useSelector((state) => state.auth.auth);
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const nav = useNavigate();
  const [value, setValue] = useState({
    title: "",
    description: "",
    tags: [],
    imageFile: "",
    script: "",
  });

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const filteredSearchValue = Object.fromEntries(
        Object.entries(searchValue).filter(([_, value]) => value.length !== 0),
      );

      const params =
        Object.keys(filteredSearchValue).length > 0 && searchValue.modelName
          ? {
              title: searchValue.modelName,
              tags: searchValue.subject,
            }
          : {
              limit: pageSize,
              page: currentPage,
            };

      const response = await GetImage(params);
      setImages(response.results);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchValue]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await GetRepoImageTag();
      const formattedTags = res.map((tag) => ({
        label: tag,
        value: tag,
      }));
      setTags(formattedTags);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchImages();
    fetchTags();
  }, [fetchImages, fetchTags]);

  const handleImageClick = useCallback(
    (file) => {
      nav("/image-view", { state: { file }, replace: true });
    },
    [nav],
  );

  const handleFile = useCallback((file) => {
    setValue((prev) => ({
      ...prev,
      imageFile: file,
      readyToUpload: true,
    }));
    setImagePreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleRemove = useCallback(() => {
    setValue((prev) => ({ ...prev, imageFile: "" }));
    setImagePreviewUrl(null);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSizeChange = useCallback((_, size) => {
    setCurrentPage(1);
    setPageSize(size);
  }, []);

  const handleUpload = useCallback(
    async (values) => {
      setLoading(true);
      const formData = new FormData();
      formData.append("imageFile", value.imageFile);
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("tags[]", values.tags);

      setLoading(true);
      try {
        await PostImage(formData);
        form.resetFields();
        setValue({
          title: "",
          description: "",
          tags: [],
          imageFile: "",
          script: "",
        });
        setOpen(false);
        fetchImages();
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
        setOpen(false);
      }
    },
    [value.imageFile, form, fetchImages],
  );

  const handleDelete = useCallback(async (id) => {
    try {
      await DeleteImage(id);
      setImages((prev) => prev.filter((image) => image.id !== id));
      message.success("Deleted Successfully!");
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  }, []);
  const handleChange = (value, name) => {
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderImageCard = useCallback(
    (val) => (
      <Col key={val.id} className="gutter-row" span={8}>
        <div style={{ padding: "8px 0" }}>
          <Card hoverable className="glass-effect-card">
            <Image src={val.imageURL || noimage} />
            <Row align="flex-end" justify="space-between" style={{ padding: 10 }}>
              <Typography>{val.title}</Typography>
              <Row>
                <Button type="primary" icon={<EyeOutlined />} onClick={() => handleImageClick(val)} size="medium" />
                {user.role !== "teacher" && (
                  <Popconfirm
                    title="Are you sure to delete this image?"
                    onConfirm={() => handleDelete(val.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger size="medium" type="primary" icon={<DeleteOutlined />} className="ml-2" />
                  </Popconfirm>
                )}
              </Row>
            </Row>
          </Card>
        </div>
      </Col>
    ),
    [handleDelete, handleImageClick, user.role],
  );
  const options = [];
  return (
    <div className="overflow-x-hidden h-full relative">
      {user.role === "teacher" && (
        <div className="flex items-center justify-between">
          <span className="text-xl m-0">Images</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <ConfigProvider theme={ThemeConfig.light}>
          <Modal width={600} open={open} onCancel={() => setOpen(false)} className="custom-close-button" footer={null}>
            <Typography className="text-xl text-center pt-10">Add Image</Typography>
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
                }}
                onFinish={handleUpload}
                autoComplete="off"
                form={form}
              >
                <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">Title</Typography>
                <Form.Item
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: "Please input your title!",
                    },
                  ]}
                >
                  <Input
                    className=" p-3"
                    placeholder="Please enter the title"
                    onChange={(e) => handleChange(e.target.value, "title")}
                  />
                </Form.Item>
                <Typography className="text-left uppercase text-gray-500 mb-1">Tag</Typography>
                <Form.Item name="tags">
                  <Select
                    style={{ width: "100%", height: "50px" }}
                    placeholder="Please select tags"
                    className="custom-select-css"
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
                <Form.Item name="description" rules={[{ required: true, message: "Please enter description!" }]}>
                  <TextArea
                    className=" resize-none p-3"
                    rows={3}
                    placeholder="Please enter description"
                    onChange={(e) => handleChange(e.target.value, "description")}
                  />
                </Form.Item>
                <div className="w-full h-30 border-dashed rounded-md flex justify-center border-gray-200 pt-5 mb-5">
                  <Form.Item name="imageFile" rules={[{ required: true, message: "Please enter imageFile!" }]}>
                    <Upload
                      name="imageFile"
                      listType="picture"
                      beforeUpload={(file) => {
                        handleFile(file);
                        return false;
                      }}
                      maxCount={1}
                      accept=".jpg,.jpeg"
                      onRemove={() => handleRemove()}
                      fileList={value.imageFile ? [value.imageFile] : []}
                    >
                      <Button className="bg-[#F8F2FF] border-none rounded-md">
                        Upload
                        <UploadOutlined />
                      </Button>
                    </Upload>
                  </Form.Item>
                </div>
                <Typography style={{ color: "purple", marginBottom: 12 }}>
                  Only monoscopic 360 images are allowed. Minimum dimensions: 2048x1024
                </Typography>
                <Form.Item
                  wrapperCol={{
                    offset: 9,
                    span: 16,
                  }}
                >
                  <Button type="primary" loading={loading} htmlType="submit" className="ml-2">
                    Submit <Image src={rightArrow} preview={false} alt="right arrow" />
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Modal>
        </ConfigProvider>
      </div>
      <div className="max-h-[65vh] overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center items-center w-full min-h-[100%]">
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>{images.map(renderImageCard)}</Row>
        )}
      </div>
      <div className="flex justify-between items-center fixed bottom-[10px] w-[97%]">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalResults}
          onChange={handlePageChange}
          onShowSizeChange={handleSizeChange}
          style={{ marginTop: "20px", textAlign: "center" }}
          showSizeChanger
        />
      </div>

      {user.role !== "teacher" && (
        <Tooltip placement="left" title="Add Image">
          <FloatButton.Group
            trigger="click"
            type="primary"
            style={{
              position: "fixed",
              left: "90%",
              bottom: "5%",
            }}
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default Image360;
