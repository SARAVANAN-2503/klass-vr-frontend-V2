import React, { useEffect, useRef, useState } from "react";
import {
  Col,
  Collapse,
  Row,
  Typography,
  Spin,
  Card,
  Input,
  Select,
  Upload,
  Form,
  Space,
  Radio,
  Image,
  ConfigProvider,
} from "antd";
import { Button, Modal } from "antd";
import { GetImage, GetTeacherImageTag, PostImage } from "../../../services/Index";
import TextArea from "antd/es/input/TextArea";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import "./style.css";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import rightArrow from "../../../assets/icons/right-arrow.svg";
import searchIcon from "../../../assets/icons/search.svg";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/config/redux";
import { MdDeleteOutline } from "react-icons/md";
import ThemeConfig from "../../../utils/ThemeConfig";

dayjs.extend(customParseFormat);

const Image360 = ({ content, _edit, setContent, addLoader, handleBack, handleClose, handleSave, setActiveKey }) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [form] = Form.useForm();

  // State
  const [dataValue, setDataValue] = useState([
    {
      title: "",
      description: "",
      tags: [],
      imageFile: "",
      script: "",
    },
  ]);

  const [value4, setValue4] = useState("");
  const [searchValue, setSearchValue] = useState({ title: "", tags: [] });
  const [tags, setTags] = useState([]);
  const [scriptReadingTime, setScriptReadingTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(content.imageDetails?.[0]?.imageDetail?.imageURL || null);
  const [loading, setLoading] = useState(false);
  const [showCollapse, setShowCollapse] = useState(Boolean(content.imageDetails?.length));
  const [open, setOpen] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [imageList, setImageList] = useState([]);
  const [contentValue, setContentValue] = useState({
    script: content.imageDetails?.[0]?.script || "",
    ImageId: content.imageDetails?.[0]?.ImageId || "",
    displayTime: content.imageDetails?.[0]?.displayTime || "05:00",
  });

  const scrollRef = useRef(null);
  const wordsPerMinute = 200;

  // Constants
  const optionsWithDisabled = [
    { label: "Local Image", value: "local" },
    { label: "Repo Image", value: "repo" },
  ];

  const style = { padding: "8px 0" };
  const imgStyle = { display: "block", width: "100%", height: 180 };

  // Handlers
  const handleDelete = () => {
    setDataValue([{ title: "", description: "", tags: "", imageFile: "", script: "" }]);
    setContent((prev) => ({ ...prev, imageDetails: [] }));
    setValue4("");
    setContentValue({ script: "", ImageId: "", displayTime: "05:00" });
    setShowCollapse(false);
    setImagePreviewUrl(null);
  };

  const handleImageSelect = (selectedImage) => {
    setImagePreviewUrl(selectedImage.imageURL);
    const newContentValue = {
      ...contentValue,
      ImageId: selectedImage.id,
    };
    setContentValue(newContentValue);
    setContent((prev) => ({ ...prev, imageDetails: [newContentValue] }));
    setShowCollapse(true);
    setOpenModel(false);
  };

  const handleChangeOption = (value, field) => {
    const updatedContentValue = { ...contentValue, [field]: value };
    setContentValue(updatedContentValue);
    setContent((prev) => ({ ...prev, imageDetails: [updatedContentValue] }));
  };

  const handleChangeTime = (time, name) => {
    const formattedTime = time.format("mm:ss");
    const updatedValue = { ...contentValue, [name]: formattedTime };
    setContentValue(updatedValue);
    setContent((prev) => ({ ...prev, imageDetails: [updatedValue] }));
  };

  const handleUpload = async () => {
    const { imageFile, title, description, tags } = dataValue[0];
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    formData.append("title", title);
    formData.append("description", description);
    tags.forEach((tag) => formData.append("tags[]", tag.trim()));

    setLoading(true);
    try {
      const response = await PostImage(formData);
      setImagePreviewUrl(response.imageURL);
      setOpen(false);
      setShowCollapse(true);

      const newContentValue = { ...contentValue, ImageId: response.id };
      setContentValue(newContentValue);
      setContent((prev) => ({ ...prev, imageDetails: [newContentValue] }));

      form.resetFields();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value, field, index) => {
    setDataValue((prevState) => {
      const newDataValue = [...prevState];
      newDataValue[index] = {
        ...newDataValue[index],
        [field]: value,
      };
      return newDataValue;
    });
  };

  const handleRemovefile = (index) => {
    // Logic to handle file removal
    const updatedContent = [...dataValue];
    updatedContent[index] = {
      ...updatedContent[index],
      imageFile: null,
      readyToUpload: false,
    };
    setDataValue(updatedContent);
  };


  const handleFile = (file) => {
    const updatedContent = [...dataValue];
    updatedContent[0] = {
      ...updatedContent[0],
      imageFile: file,
      readyToUpload: true,
    };
    setDataValue(updatedContent);
  };

  // Effects
  useEffect(() => {
    if (contentValue.script?.length > 5) {
      const words = contentValue.script.split(/\s+/).length;
      const totalSeconds = Math.ceil((words / wordsPerMinute) * 60);

      setScriptReadingTime({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    }
  }, [contentValue.script]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filteredSearchValue = Object.fromEntries(
          Object.entries(searchValue).filter(([_, value]) => value !== ""),
        );

        const imageResponse = await GetImage(
          Object.keys(filteredSearchValue).length > 0 ? filteredSearchValue : undefined,
        );
        setImageList(imageResponse.results);

        const tagsResponse = await GetTeacherImageTag();
        setTags(tagsResponse.map((tag) => ({ label: tag, value: tag })));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchData();
  }, [searchValue]);

  const items = [
    {
      key: "1",
      label: "360 Image",
      children: (
        <>
          <Form
            name="basic"
            initialValues={{
              remember: true,
              script: content.imageDetails?.[0]?.script || "",
              displayTime: content.imageDetails?.[0]?.displayTime || "",
            }}
            onFinish={handleSave}
            autoComplete="off"
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Script"
                  name="script"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your character script!",
                    },
                    {
                      min: 5,
                      message: "Character script must be at least 5 characters!",
                    },
                  ]}
                >
                  <TextArea
                    name="script"
                    value={contentValue.script}
                    onChange={(e) => handleChangeOption(e.target.value, "script")}
                    placeholder="Please enter your Image script"
                    autoSize={{ minRows: 11, maxRows: 11 }}
                    className="mb-2"
                  />
                </Form.Item>
                <Typography className="text-right">
                  <span className="flex items-center justify-start gap-4">
                    Reading Time{" "}
                    <span className="bg-black px-8 py-2 rounded-full text-[#fff]">
                      {scriptReadingTime.minutes} min(s)
                    </span>
                  </span>
                </Typography>
                <br />
                {/* <Row className=""> */}
                <Form.Item
                  name="displayTime"
                  rules={[
                    {
                      required: true,
                      message: "Please enter displayTime!",
                    },
                  ]}
                  className="w-full"
                  label="video Duration"
                >
                  <LocalizationProvider className="w-full" dateAdapter={AdapterDayjs}>
                    <TimePicker
                      className="w-full"
                      value={dayjs(contentValue.displayTime, "mm:ss")}
                      onChange={(time) => handleChangeTime(time, "displayTime")}
                      views={["minutes", "seconds"]}
                      format="mm:ss"
                    />
                  </LocalizationProvider>
                </Form.Item>
                {/* </Row> */}
              </Col>
              <Col span={12}>
                {imagePreviewUrl && (
                  <>
                    <Col span={24}>
                      <Image src={imagePreviewUrl} className="rounded-[16px]" />
                    </Col>
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <div className="fixed top-[24px] right-[30px]">
                  <Button
                    className="bg-[#fff] text-[#000]"
                    icon={<MdDeleteOutline />}
                    type="primary"
                    size="large"
                    danger
                    onClick={handleDelete}
                  ></Button>
                </div>
              </Col>
            </Row>
            {_edit ? (
              <div className="fixed top-[-38px] right-[10px]">
                <Form.Item className="m-0">
                  <Button type="primary" htmlType="submit" loading={addLoader} className="form-button">
                    {_edit ? "Save" : "Continue"}
                  </Button>
                </Form.Item>
              </div>
            ) : (
              <Col span={24}>
                <div className="mt-5 flex justify-end">
                  <Button type="default" className="mr-5" onClick={handleClose}>
                    Close
                  </Button>
                  <Button type="primary" className="mr-5" onClick={() => handleBack("3")}>
                    Back
                  </Button>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={addLoader}>
                      Save & Next
                    </Button>
                  </Form.Item>
                </div>
              </Col>
            )}
          </Form>
        </>
      ),
    },
  ];

  const handleSearch = (e) => {
    const { name, value } = e.target;

    setSearchValue((state) => ({
      ...state,
      [name]: value,
    }));
  };
  return (
    <Spin spinning={loading}>
      {showCollapse ? (
        <Collapse defaultActiveKey={["1"]} accordion items={items} />
      ) : (
        <>
          <div className="inner-glass-card">
            <p className="header-text font-[700] text-[24px]">360 Image</p>
            <Radio.Group
              options={optionsWithDisabled}
              onChange={({ target: { value } }) => {
                setValue4(value);
                if (value === "local") setOpen(true);
                if (value === "repo") setOpenModel(true);
              }}
              value={value4}
              optionType="button"
              buttonStyle="solid"
              className="image_360_buttons ml-1"
            />
          </div>
          {!_edit && (
            <Col span={24}>
              <div className="flex justify-start gap-4 mt-5 pl-4">
                <Button type="primary" onClick={() => handleBack("3")} size="large" className="rounded-full bg-black">
                  Previous
                </Button>
                <Button
                  type="primary"
                  onClick={() => setActiveKey("5")}
                  size="large"
                  className="form-button skip-button"
                >
                  Skip
                </Button>
              </div>
            </Col>
          )}
        </>
      )}
      <ConfigProvider theme={ThemeConfig.light}>
        <Modal
          width={600}
          open={open}
          onCancel={() => {
            setOpen(false);
            setValue4("");
          }}
          className="custom-close-button"
          footer={null}
        >
          <Typography className="text-xl text-center pt-10">Add Image</Typography>
          <div className="flex justify-center">
            <Form
              name="basic"
              className="w-[536px]"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              initialValues={{ remember: true }}
              onFinish={handleUpload}
              autoComplete="off"
              form={form}
            >
              <Typography className="text-left text-sm uppercase text-gray-500 mt-3 mb-1">Title</Typography>
              <Form.Item name={`title-${0}`} rules={[{ required: true, message: "Please input your Title!" }]}>
                <Input
                  className="p-3"
                  placeholder="Please enter the Title"
                  onChange={(e) => handleChange(e.target.value, "title", 0)}
                />
              </Form.Item>
              <Typography className="text-left uppercase text-gray-500 mb-1">Description</Typography>
              <Form.Item name={`description-${0}`} rules={[{ required: true, message: "Please Enter description!" }]}>
                <TextArea
                  className="resize-none p-3"
                  placeholder="Please enter the description"
                  onChange={(e) => handleChange(e.target.value, "description", 0)}
                />
              </Form.Item>
              <div className="w-full h-30 border-dashed rounded-md flex justify-center border-gray-200 pt-5 mb-5">
                <Form.Item name={`imageFile-${0}`} rules={[{ required: true, message: "Please Enter imageFile!" }]}>
                  <Upload
                    name={`imageFile-${0}`}
                    listType="picture"
                    beforeUpload={(file) => {
                      handleFile(file);
                      return false;
                    }}
                    maxCount={1}
                    accept=".jpg,.jpeg"
                    onRemove={() => handleRemovefile(0)}
                    fileList={dataValue[0].imageFile ? [dataValue[0].imageFile] : []}
                  >
                    {!dataValue[0].imageFile && (
                      <Button className="border-none rounded-md">
                        Upload
                        <UploadOutlined />
                      </Button>
                    )}
                  </Upload>
                </Form.Item>
              </div>
              <Typography style={{ color: "purple", marginBottom: 12 }}>
                Only monoscopic 360 images are allowed. Minimum dimensions: 2048x1024
              </Typography>
              <Form.Item wrapperCol={{ offset: 10, span: 16 }} className="mt-5">
                <Button type="primary" loading={loading} htmlType="submit">
                  Submit <Image src={rightArrow} alt="right arrow" preview={false} />
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>

        <Modal
          open={openModel}
          onCancel={() => {
            setSearchValue({ title: "", tags: "" });
            setOpenModel(false);
            setValue4("");
          }}
          className="custom-close-button"
          footer={null}
          width={800}
        >
          <div className="py-5 px-3">
            <div className="flex flex-col items-center justify-between p-4">
              <Typography className="text-xl pt-3 m-0">Select Image</Typography>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search the Image, tags"
                    className="w-[420px] p-3 border-none rounded-xl"
                    value={searchValue.title}
                    name="title"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch(e)}
                  />
                </div>
              </div>
            </div>
            {loadingImages ? (
              <div style={{ textAlign: "center" }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </div>
            ) : (
              <div ref={scrollRef} className="flex gap-4 overflow-hidden my-4">
                {imageList.map((val, index) => (
                  <div style={style} key={index}>
                    <Card
                      hoverable
                      onClick={() => handleImageSelect(val)}
                      className="h-[260px] w-[400px] flex flex-col border-gray-300 ml-4"
                    >
                      <Image alt="thumbnailUrl" src={val.imageURL} style={imgStyle} className="rounded-lg" />
                      <Typography className="font-bold mt-3">{val.title}</Typography>
                    </Card>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" })}
                className="border-none bg-[#F8F2FF] text-[#9A4BFF] w-2 rounded-full text-md"
              >
                {"<"}
              </Button>
              <Button
                onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" })}
                className="border-none bg-[#F8F2FF] text-[#9A4BFF] w-2 rounded-full text-md"
              >
                {">"}
              </Button>
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </Spin>
  );
};

export default Image360;
