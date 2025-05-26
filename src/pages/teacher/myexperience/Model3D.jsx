import { useEffect, useRef, useState } from "react";
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
  message,
  Tooltip,
  Image,
  ConfigProvider,
} from "antd";
import { Button, Modal } from "antd";
import { GetModel, GetTeacherModelTag, PostModel } from "../../../services/Index";
import TextArea from "antd/es/input/TextArea";
import { UploadOutlined } from "@ant-design/icons";
import ModelViewer from "../../../components/modelViewer/ModelViewer";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import subjectOptions from "../../../json/subject";
import rightArrow from "../../../assets/icons/right-arrow.svg";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/config/redux"; 
import { GoArrowRight } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import ThemeConfig from "../../../utils/ThemeConfig";

dayjs.extend(customParseFormat);

const Model3D = ({ handleBack, handleClose, handleSave, content, _edit, setContent, addLoader, setActiveKey }) => {
  const style = {
    padding: "8px 0",
  };
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [dataValue, setDataValue] = useState({
    modelName: "",
    description: "",
    tags: [],
  });
  const [form] = Form.useForm();
  const [scriptReadingTime, setScriptReadingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [searchValue, setSearchValue] = useState({
    modelName: "",
    tags: [],
  });
  const wordsPerMinute = 200;
  const [tags, setTags] = useState([]);
  const [modelDuration, setModelDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modelList, setModelList] = useState([]);
  const [modelOpen, setModalOpen] = useState(false);
  const [indexSaver, setIndexSaver] = useState(0);
  const [modelValue, setModelValue] = useState([]);
  const [contentValue, setContentValue] = useState([
    {
      script: "",
      modelId: "",
      modelUrl: "",
      displayTime: "02:00",
    },
  ]);
  const [isFormValidList, setIsFormValidList] = useState(contentValue.map(() => false));
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const initialContentValue = content.modelDetails.map((modelDetail) => ({
      script: modelDetail.script,
      modelId: modelDetail.modelData?.id,
      modelUrl: modelDetail?.modelData?.modelUrl,
      displayTime: modelDetail.displayTime,
      modelCoordinates: modelDetail?.modelCoordinates,
    }));
    setContentValue(initialContentValue);
  }, []);

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearchValue((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleDelete = (index) => {
    const filteredContent = contentValue.filter((_, idx) => idx !== index);
    setContentValue(filteredContent);
    setContent((prevContent) => ({
      ...prevContent,
      modelDetails: filteredContent,
    }));
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleModelSelect = (model) => {
    let tempValue = contentValue;
    tempValue[indexSaver] = {
      ...tempValue[indexSaver],
      modelId: model.id,
      modelUrl: model.modelUrl,
    };
    setContentValue(tempValue);
    setContent((prevContent) => ({
      ...prevContent,
      modelDetails: tempValue,
    }));
    setOpenModel(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectModel = async (index) => {
    setIndexSaver(index);
    try {
      setOpenModel(true);
    } catch (error) {
      console.error("Error fetching model list:", error);
    }
  };

  const showModal = (index) => {
    setIndexSaver(index);
    setOpen(true);
  };

  const handleChange = (value, name) => {
    setDataValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeOption = (value, field, index) => {
    let tempvalue = contentValue;
    tempvalue[index] = {
      ...tempvalue[index],
      [field]: value,
    };
    setContentValue(tempvalue);
    setContent((prevContent) => ({
      ...prevContent,
      modelDetails: tempvalue,
    }));
  };

  const handleFinish = async (values) => {
    const formData = new FormData();
    const value = dataValue;
    formData.append("modelFile", value.model);
    formData.append("modelName", value.modelName);
    formData.append("description", value.description);
    formData.append("tags[]", value.tags);
    formData.append("thumbnailFile", value.model);
    setLoading(true);
    try {
      const response = await PostModel(formData);
      let tempValue = contentValue;
      tempValue[indexSaver] = {
        ...tempValue[indexSaver],
        modelId: response.id,
        modelUrl: response.modelUrl,
      };
      setContentValue(tempValue);
      setContent((prevContent) => ({
        ...prevContent,
        modelDetails: tempValue,
      }));
      setLoading(false);
      message.success("Model uploaded successfully");
    } catch (error) {
      message.error("Failed to upload model");
      console.error("Upload failed:", error);
    }

    setOpen(false);
    form.resetFields();
  };

  useEffect(() => {
    if (dataValue.modelFile && dataValue.modelFile.type?.includes("model/")) {
      const model = document.createElement("model");
      model.src = URL.createObjectURL(dataValue.modelFile);
      model.onloadedmetadata = () => {
        setModelDuration(model.duration);
      };
    }

    if (contentValue.script && contentValue.script.length > 5) {
      const words = contentValue.script.split(/\s+/).length;
      const totalSeconds = Math.ceil((words / wordsPerMinute) * 60);

      const hours = Math.floor(totalSeconds / 3600);
      const remainingSecondsAfterHours = totalSeconds % 3600;

      const minutes = Math.floor(remainingSecondsAfterHours / 60);
      const seconds = remainingSecondsAfterHours % 60;

      setScriptReadingTime({
        hours,
        minutes,
        seconds,
      });
    }
  }, [dataValue, setDataValue, wordsPerMinute, contentValue]);

  useEffect(() => {
    const filteredSearchValue = Object.fromEntries(Object.entries(searchValue).filter(([key, value]) => value !== ""));

    if (Object.keys(filteredSearchValue).length > 0) {
      const data = {
        ...filteredSearchValue,
        limit: pageSize,
        page: currentPage,
      };
      GetModel(data).then((res) => {
        setModelList(res.results);
      });
    } else {
      GetModel().then((res) => {
        setModelList(res.results);
      });
    }
    GetTeacherModelTag().then((res) => {
      const formattedTags = res.map((tag) => ({
        label: tag,
        value: tag,
      }));
      setTags(formattedTags);
    });
  }, [searchValue]);

  const handleFile = (file) => {
    setDataValue((prevValue) => ({
      ...prevValue,
      model: file,
      readyToUpload: true,
    }));
  };

  const handleRemovefile = (index) => {
    const updatedContent = contentValue.filter((_, i) => i !== index);
    setContentValue(updatedContent);
  };

  const handleChangeTime = (time, name, index) => {
    const formattedTime = time.format("mm:ss");
    const tempValue = [...contentValue];
    tempValue[index] = {
      ...tempValue[index],
      displayTime: formattedTime,
    };
    setContentValue(tempValue);
    setContent((prevContent) => ({
      ...prevContent,
      modelDetails: tempValue,
    }));
  };

  const panels = contentValue.map((val, index) => (
    <Collapse.Panel header={`Model ${index + 1}`} key={index}>
      <Row className="flex gap-2 ">
        <Button
          style={{ marginLeft: "0px" }}
          onClick={() => showModal(index)}
          className="dashed-button rounded-full text-[#9a4bff]"
          size="large"
        >
          Local Model
          <GoArrowRight />
        </Button>

        <Button
          style={{ marginLeft: "5px" }}
          onClick={() => handleSelectModel(index)}
          className="dashed-button rounded-full text-[#9a4bff]"
          size="large"
        >
          Repo Model
          <GoArrowRight />
        </Button>
      </Row>
      <br />
      <Form
        name="basic"
        initialValues={{
          remember: true,
          displayTime: val.displayTime ? dayjs(val.displayTime, "mm:ss") : null,
          script: val.script,
        }}
        layout="vertical"
        onFinish={handleSave}
        autoComplete="off"
        onValuesChange={(changedValues, allValues) => {
          const isCurrentFormValid = allValues.script && allValues.script.trim().length > 5 && allValues.displayTime;

          setIsFormValidList((prevList) => {
            const newList = [...prevList];
            newList[index] = isCurrentFormValid;
            return newList;
          });
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Script"
              name="script"
              rules={[
                {
                  required: contentValue[index].modelId != "",
                  message: "Script Missing!",
                },
                {
                  min: 5,
                  message: "Character script must be at least 5 characters!",
                },
              ]}
            >
              <TextArea
                name="script"
                value={val.script}
                disabled={contentValue[index].modelId == ""}
                onChange={(e) => handleChangeOption(e.target.value, "script", index)}
                placeholder="Please enter your Model script"
                autoSize={{ minRows: 12, maxRows: 12 }}
              />
            </Form.Item>

            <Form.Item
              name="displayTime"
              rules={[
                {
                  required: true,
                  message: "Please enter your character displayTime!",
                },
              ]}
              className="w-full"
              label="Interaction Timer"
            >
              <LocalizationProvider className="w-full" dateAdapter={AdapterDayjs}>
                <TimePicker
                  className="w-full"
                  value={dayjs(val.displayTime, "mm:ss")}
                  onChange={(time) => handleChangeTime(time, "displayTime", index)}
                  views={["minutes", "seconds"]}
                  format="mm:ss"
                />
              </LocalizationProvider>
            </Form.Item>
          </Col>
          <Col span={12} className="mt-6">
            <>
              {(index === 0 || val.modelUrl) && (
                <Card className="glass-effect">
                  {val.modelId ? (
                    <>
                      <div className="flex flex-col gap-0 items-center h-76">
                        <ModelViewer
                          modelUrl={val.modelUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            focus: true,
                          }}
                        />
                      </div>
                      <div style={{ color: "black", margin: 12 }}>
                        Note: Uploading a Model Exceding 1,00,000 PolyCount may cause performance degradation on device
                      </div>
                    </>
                  ) : (
                    <p>Model Not Found</p>
                  )}
                </Card>
              )}
            </>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="flex">
            <Space align="center" style={{ width: "100%", paddingTop: "11px" }} justify="space-between">
              <div className="fixed top-[24px] right-[30px]">
                <Button
                  className="bg-[#fff] text-[#000]"
                  icon={<MdDeleteOutline />}
                  type="primary"
                  size="large"
                  danger
                  onClick={() => handleDelete(index)}
                ></Button>
              </div>

              {isFormValidList[index] && (
                <Button type="primary" className="mr-3" onClick={() => addNewModel(contentValue.length)}>
                  Add More
                </Button>
              )}
            </Space>
            {_edit ? (
              <div className="fixed top-[-38px] right-[10px]">
                <Form.Item className="m-0">
                  <Button type="primary" htmlType="submit" loading={addLoader} className="form-button">
                    {_edit ? "Save" : "Continue"}
                  </Button>
                </Form.Item>
              </div>
            ) : (
              <Space>
                <div className="pt-7 flex justify-end">
                  <Button type="default" className="mr-5" onClick={handleClose}>
                    Close
                  </Button>
                  <Button type="primary" className="mr-3" onClick={() => handleBack("4")}>
                    Back
                  </Button>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={addLoader}>
                      Save & Next
                    </Button>
                  </Form.Item>
                </div>
              </Space>
            )}
          </Col>
        </Row>
        <Col span={24}></Col>
      </Form>
    </Collapse.Panel>
  ));

  const addNewModel = (index) => {
    if (index != 3) {
      setContentValue([
        ...contentValue,
        {
          script: "",
          modelId: "",
          modelUrl: "",
          displayTime: "02:00",
        },
      ]);
    } else {
      message.warning("Model Limit Reached");
    }
  };

  return (
    <Spin spinning={addLoader}>
      <Collapse defaultActiveKey={["1"]} accordion>
        {panels}
      </Collapse>
      {contentValue.length < 3 && (
        <>
          {contentValue.length == 0 && (
            <Col span={24}>
              <div className="inner-glass-card">
                <p className="header-text font-[700] text-[24px]">3D Model</p>
                <Button onClick={() => addNewModel(contentValue.length)} className="custom-model-add-button">
                  Add Model
                </Button>
              </div>
              {!_edit && (
                <div className=" flex justify-start gap-4 mt-5 pl-4">
                  <Button type="primary" onClick={() => handleBack("4")} size="large" className="rounded-full bg-black">
                    Previous
                  </Button>

                  <Button
                    type="primary"
                    onClick={() => setActiveKey("6")}
                    size="large"
                    className="form-button skip-button"
                  >
                    Skip
                  </Button>
                </div>
              )}
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
          }}
          className="custom-close-button"
          footer={null}
        >
          <Typography className="text-xl text-center pt-10">Add 3D Model</Typography>
          <div className="flex justify-center">
            <Form
              name="basic"
              className="w-[536px] "
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              initialValues={{
                remember: true,
              }}
              onFinish={handleFinish}
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
              <Form.Item name="description" rules={[{ required: true, message: "Please Enter description!" }]}>
                <TextArea
                  className=" resize-none p-3"
                  placeholder="Please enter the description"
                  onChange={(e) => handleChange(e.target.value, "description")}
                />
              </Form.Item>
              <div className="w-full h-30 border-dashed rounded-md flex justify-center border-gray-200 pt-5 mb-5">
                <Form.Item name="modelUrl" rules={[{ required: true, message: "Please Enter modelUrl!" }]}>
                  <Upload
                    name={`modelUrl`}
                    listType="picture"
                    beforeUpload={(file) => {
                      handleFile(file);
                      return false;
                    }}
                    accept=".glb,.gltf"
                    maxCount={1}
                    onRemove={() => handleRemovefile()}
                  >
                    <Tooltip placement="right" title="Supported Formats: .glb">
                      <Button className=" border-none rounded-md">
                        Upload
                        <UploadOutlined />
                      </Button>
                    </Tooltip>
                  </Upload>
                </Form.Item>
              </div>
              <Typography style={{ color: "purple", marginBottom: 12 }}>
                Uploading a Model Exceding 1,00,000 PolyCount may cause performance degradation on device
              </Typography>
              <Form.Item
                wrapperCol={{
                  offset: 10,
                  span: 16,
                }}
              >
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit <Image src={rightArrow} alt="right arrow" />
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
        <Modal
          open={openModel}
          onCancel={() => {
            setSearchValue({
              modelName: "",
              tags: [],
            }),
              setOpenModel(false);
          }}
          className="custom-close-button"
          footer={null}
          width={1012}
        >
          <div className="py-5 px-3">
            <div className="flex flex-col items-center justify-between p-4">
              <Typography className="text-xl pt-5 m-0">Select 3D Model</Typography>
              <div className="flex items-center justify-between mt-7">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search the model, tags"
                    className="w-[420px] p-3 border-none rounded-xl"
                    value={searchValue.modelName}
                    name="modelName"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch(e)}
                  />
                </div>
              </div>
            </div>
            {modelList.length === 0 ? (
              <div style={{ textAlign: "center" }}>
                <Typography>No Data Found</Typography>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex gap-4 overflow-hidden my-4">
                  {modelList.map((val, index) => (
                    <div style={style} key={index}>
                      <Card
                        hoverable
                        onClick={() => handleModelSelect(val, index)}
                        style={{ cursor: "pointer" }}
                        className="w-[400px] flex flex-col border-gray-300 ml-4"
                      >
                        <ModelViewer
                          modelUrl={val.modelUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            focus: true,
                          }}
                        />
                        <Typography className="mt-4">{val.modelName}</Typography>
                      </Card>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={scrollLeft}
                    className="border-none bg-[#F8F2FF] text-[#9A4BFF] w-2 rounded-full text-md"
                  >
                    {"<"}
                  </Button>
                  <Button
                    onClick={scrollRight}
                    className="border-none bg-[#F8F2FF] text-[#9A4BFF] w-2  rounded-full text-md"
                  >
                    {">"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
        <Modal title="View Model" open={modelOpen} onCancel={() => setModalOpen(false)} footer={null}>
          <Col span={24} className="p-2">
            <Card>
              <div className="flex flex-col gap-0 items-center h-96">
                <ModelViewer
                  modelUrl={modelValue.modelUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    focus: true,
                  }}
                />
              </div>
            </Card>
          </Col>
        </Modal>
      </ConfigProvider>
    </Spin>
  );
};

export default Model3D;
