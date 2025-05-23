import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import { PatchImage } from "../../../services/Index";
import ContentWrapper from "../../../components/ContentWrapper";
import { useSelector } from "react-redux";
import subjectOptions from "../../../json/subject";
import rightArrow from "../../../assets/icons/right-arrow.svg";
import { useAppSelector } from "../../../store/config/redux";

const ImageView = () => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.auth.auth);
  const {
    state: { file },
  } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState({
    id: file.id,
    title: file.title,
    description: file.description,
    tags: file.tags,
  });
  const [form] = Form.useForm();

  const goBack = () => {
    navigate("/content_repo", { replace: true });
  };

  const handleUpload = async (values) => {
    setUploading(true);
    try {
      const data = {
        title: values.title,
        description: values.description,
        tags: [values.tags], // No need to use `[]` here
      };
  
      await PatchImage(value.id, data); // Ensure you use `values.id`
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };
  

  const handleChange = (value, name) => {
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatSize = (sizeInBytes) => {
    if (sizeInBytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    return `${parseFloat((sizeInBytes / Math.pow(1024, i)).toFixed(2))} ${
      sizes[i]
    }`;
  };

  return (
    <ContentWrapper
      header={value.title + " Image"}
      extra={
        <div className="flex gap-3 items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            size="default"
            type="primary"
            onClick={goBack}
          >
            Back
          </Button>
        </div>
      }
    >
      <div className="text-start">
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <div style={{ height: "100%" }}>
                <Image src={file.imageURL} width="100%" height="100%" />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Descriptions>
                <Descriptions.Item label="Title">
                  {value.title}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions>
                  <Descriptions.Item label='Tag'>
                    {value.tags}
                  </Descriptions.Item>
              </Descriptions>
              <Descriptions>
                <Descriptions.Item label="Description">
                  {value.description}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions>
                <Descriptions.Item label="Format">
                  {file.format}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions>
                <Descriptions.Item label="File Size">
                  {formatSize(file.fileSize)}
                </Descriptions.Item>
              </Descriptions>
              {user.role !== "teacher" && (
                <Button type="primary" onClick={() => setOpen(true)}>
                  Edit
                </Button>
              )}
            </Card>
          </Col>
        </Row>

        <Modal
          width={600}
          open={open}
          className="custom-close-button"
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <Typography className="text-xl text-center pt-10">
            Edit Image
          </Typography>
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
                title: value.title || "",
                tags: value.tags ||"",
                description: value.description || "",
              }}
              onFinish={handleUpload}
              autoComplete="off"
              form={form}
            >
              <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">
                Title
              </Typography>
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: "Please input your title!" },
                ]}
              >
                <Input
                   className=" p-3"
                  placeholder="Please enter the title"
                  onChange={(e) => handleChange(e.target.value, "title")}
                />
              </Form.Item>
              <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">
                Tags
              </Typography>
              <Form.Item
                name="tags"
                rules={[{ required: true, message: "Please input your tag!" }]}
              >
                <Select
                  placeholder="Please enter the tags"
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
              <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">
                Description
              </Typography>
              <Form.Item
                name="description"
                rules={[
                  { required: true, message: "Please Enter description!" },
                ]}
              >
                <TextArea
                   className=" p-3"
                  placeholder="Please enter the description"
                  onChange={(e) => handleChange(e.target.value, "description")}
                />
              </Form.Item>

               <Form.Item wrapperCol={{ offset: 9, span: 16 }}>
                           <Button type="primary" htmlType="submit" loading={uploading}  className="ml-4">
                             Submit <Image src={rightArrow} preview={false} alt="right arrow" />
                           </Button>
                         </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </ContentWrapper>
  );
};

export default ImageView;
