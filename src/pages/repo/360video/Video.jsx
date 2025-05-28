import React, { useEffect, useState } from "react";
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
  Flex,
  Upload,
  Divider,
  Badge,
  Popconfirm,
  message,
  Form,
  FloatButton,
  Space,
  Avatar,
  Radio,
  Image,
} from "antd";
import ReactPlayer from "react-player";
import noimage from "../../../../public/no image.png";
import axios from "axios";
import TextArea from "antd/es/input/TextArea";
import { DeleteVideo, GetVideo, GetVideoImageTag, PostVideo } from "../../../services/Index";
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
  StarOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import options from "../../../json/subject";
import ContentWrapper from "../../../components/ContentWrapper";
import { useSelector } from "react-redux";
import rightArrow from "../../../assets/icons/right-arrow.svg";
import { useAppSelector } from "../../../store/config/redux";

const Video = ({ searchValue }) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const User = useSelector((state) => state.auth.auth);
  const [videoDuration, setVideoDuration] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Set initial page size
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [sorting, setSorting] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const nav = useNavigate();
  const [value, setValue] = useState({
    title: "",
    description: "",
    tags: [],
    videoFile: "",
    script: "",
    typeOfVideo: "stereoscopic-side-to-side",
  });
  const imgStyle = {
    display: "block",
    width: "100%",
    height: 250,
  };

  const style = {
    padding: "8px 0",
  };

  // const [searchValue, setSearchValue] = useState({
  //   title: "",
  //   tags: [],
  // });
  // const handleSearch = (e) => {
  //   const { name, value } = e.target;

  //   setSearchValue((state) => ({
  //     ...state,
  //     [name]: value,
  //   }));
  // };

  useEffect(() => {
    setLoading(true);
    const filteredSearchValue = Object.fromEntries(Object.entries(searchValue).filter(([key, value]) => value !== ""));

    if (Object.keys(filteredSearchValue).length > 0 && searchValue.modelName !== "") {
      const data = {
        title: searchValue.modelName,
        tags: searchValue.subject,
      };
      GetVideo(data)
        .then((response) => {
          setVideos(response.results);
          setTotalPages(response.totalPages);
          setTotalResults(response.totalResults);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      GetVideo({
        // sortBy: "title%3A"+sorting,
        limit: pageSize,
        page: currentPage,
      })
        .then((response) => {
          setVideos(response.results);
          setTotalPages(response.totalPages);
          setTotalResults(response.totalResults);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    GetVideoImageTag().then((res) => {
      const formattedTags = res.map((tag) => ({
        label: tag,
        value: tag,
      }));
      setTags(formattedTags);
    });
  }, [currentPage, pageSize, sorting, refresh, searchValue]);

  const handleVideoClick = (file) => {
    nav("/video-view", { state: { file: file }, replace: true });
  };
  const handleFile = (file) => {
    setValue((prevValue) => ({
      ...prevValue,
      videoFile: file,
      readyToUpload: true,
    }));

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
    };
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    setValue((prevContent) => ({ ...prevContent, videoFile: "" }));
    setVideoPreviewUrl(null);
    setVideoDuration(null);
  };

  const handleModalClose = () => {
    setSelectedVideo(null);
    setModalVisible(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSizeChange = (current, size) => {
    setCurrentPage(1); // Reset to the first page when changing page size
    setPageSize(size); // Update page size
  };
  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${seconds}s`;
  };
  const handleUpload = async (values) => {
    const file = value.videoFile;
    const { title, tags, videoFile, typeOfVideo, description } = values;
    const formData = new FormData();
    formData.append("videoFile", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags[]", value.tags);
    formData.append("typeOfVideo", value.typeOfVideo);
    // formData.append("thumbnailFile", file);
    setUploading(true);
    try {
      const response = await PostVideo(formData);
      form.resetFields();
      setValue({
        title: "",
        description: "",
        tags: [],
        videoFile: "",
        script: "",
        typeOfVideo: "stereoscopic-side-to-side",
      });
      setRefresh(!refresh);
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setOpen(false);
    }
  };
  const handleChange = (value, name) => {
    if (name === "typeOfVideo") {
      setValue((prev) => ({
        ...prev,
        typeOfVideo: value,
      }));
    } else {
      setValue((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDelete = (id) => {
    DeleteVideo(id)
      .then(() => {
        setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
        message.success("Deleted Successfully!");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    // <ContentWrapper
    //   header="360 Video"
    //   extra={
    //     <div className="flex gap-4">
    //           <Col span={12}>
    //             <Input
    //               placeholder="Search the title"
    //               className="min-w-72"
    //               value={searchValue.title}
    //               name="title"
    //               onChange={(e) => handleSearch(e)}
    //             />
    //           </Col>{" "}
    //           <Col span={12}>
    //             <Select
    //               allowClear
    //               mode="multiple"
    //               placeholder="Search the Tags"
    //               style={{ minWidth: 200 }}
    //               value={searchValue.tags}
    //               onChange={(value) =>
    //                 setSearchValue((prev) => ({
    //                   ...prev,
    //                   tags: value,
    //                 }))
    //               }
    //             >
    //               {tags.map((option) => (
    //                 <Select.Option key={option.value} value={option.value}>
    //                   {option.label}
    //                 </Select.Option>
    //               ))}
    //             </Select>
    //           </Col>
    //         </div>
    //   }
    //   teacher={User.role == "teacher" ? true : false}
    // >
    <div className="overflow-x-hidden h-full relative">
      {User.role == "teacher" && (
        <div className="flex items-center justify-between">
          <span className="text-xl m-0">360 Videos</span>
        </div>
      )}

      <div className="flex gap-4">
        <Modal
          width={600}
          open={open}
          className="custom-close-button"
          onCancel={() => {
            setOpen(false);
          }}
          footer={null}
        >
          <Typography className="text-xl text-center pt-10">Add Video Repo</Typography>
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
              onFinish={handleUpload}
              onFinishFailed={onFinishFailed}
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
                  onChange={(value) => handleChange(value, "tags", 0)}
                >
                  {options.map((option) => (
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
                <Form.Item name="videoFile" rules={[{ required: true, message: "Please Enter videoFile!" }]}>
                  <Upload
                    name="videoFile"
                    listType="picture"
                    beforeUpload={(file) => {
                      handleFile(file);
                      return false; // Prevent default upload behavior
                    }}
                    maxCount={1}
                    accept=".mp4,.mov,.mkv,.avi"
                    onRemove={() => handleRemove()}
                    fileList={value.videoFile ? [value.videoFile] : []}
                  >
                    <Button className="bg-[#F8F2FF] border-none rounded-md">
                      Upload <UploadOutlined />
                    </Button>
                  </Upload>
                </Form.Item>
              </div>
              <Typography className="text-left uppercase text-gray-500 relative top-5 mb-0">Type of Video</Typography>
              <Row size={24} className="flex">
                <Radio.Group
                  value={value.typeOfVideo}
                  onChange={(e) => handleChange(e.target.value, "typeOfVideo")}
                  className="flex p-0"
                >
                  <Radio value={"stereoscopic-side-to-side"} className="flex flex-col-reverse gap-3 w-[172px]">
                    <Image src="../../../src/assets/Stereoscopic - Side to Side.png" width={172} height={113} />
                    <Typography className="text-center mb-0 capitalize">stereoscopic side-side</Typography>
                  </Radio>
                  <Radio value={"stereoscopic-top-to-bottom"} className="flex flex-col-reverse gap-3 w-[172px]">
                    <Image src="../../../src/assets/Stereoscopic - Top to Bottom.png" width={172} height={113} />
                    <Typography className="text-center mb-0 capitalize">stereoscopic top-bottom</Typography>
                  </Radio>
                  <Radio value={"monoscopic"} className="flex flex-col-reverse gap-3 w-[172px]">
                    <Image src="../../../src/assets/Monoscopic.png" width={172} height={113} />
                    <Typography className="text-center mb-0 capitalize">monoscopic</Typography>
                  </Radio>
                </Radio.Group>
              </Row>
              {videoDuration && (
                <Form.Item label="Video Duration">
                  <Badge count={formatDuration(videoDuration)} />
                </Form.Item>
              )}
              {videoPreviewUrl && (
                <>
                  <Divider />
                  <Row>
                    <Col span={24}>
                      <video controls style={{ width: "100%" }}>
                        <source src={videoPreviewUrl} type="video/mp4" />
                      </video>
                    </Col>
                  </Row>
                </>
              )}
              <Divider />

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

        {/* When change the float button to uncomment the button */}
        {/* <Tooltip placement="top" title="Add Video">
            <Button
              type="primary"
              onClick={() => setOpen(true)}
              icon={<PlusOutlined />}
            >
              Add Video
            </Button>
          </Tooltip> */}
      </div>

      <div className="max-h-[65vh] overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center items-center w-full min-h-[80vh]">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div>Error loading videos. Please try again.</div>
        ) : (
          <Row
            gutter={{
              xs: 8,
              sm: 16,
              md: 24,
              lg: 32,
            }}
          >
            {videos.map((val, index) => (
              <Col key={index} className="gutter-row" span={8}>
                <div style={style}>
                  <Card hoverable className="glass-effect-card">
                    <Row>
                      <img alt="thumbnail" src={val.thumbnail ? val.thumbnail : noimage} style={imgStyle} />
                    </Row>
                    <Row
                      align="flex-end"
                      justify="space-between"
                      style={{
                        padding: 10,
                      }}
                    >
                      <Typography>{val.title}</Typography>
                      <Row>
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() => handleVideoClick(val)}
                          size="medium"
                        />
                        &nbsp;
                        {User.role != "teacher" && (
                          <Popconfirm
                            title="Are you sure to delete this video?"
                            onConfirm={() => handleDelete(val.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button danger size="medium" type="primary" icon={<DeleteOutlined />} />
                          </Popconfirm>
                        )}
                      </Row>
                    </Row>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
      <Modal open={modalVisible} onCancel={handleModalClose} footer={null} destroyOnClose>
        {selectedVideo && (
          <iframe
            title="Simulation"
            src="https://klass-vr-file.s3.ap-south-1.amazonaws.com/klass-simulations/Hibiscus/index.html"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </Modal>
      <div className="flex justify-between items-center fixed bottom-[10px] w-[97%]">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalResults}
          onChange={handlePageChange}
          onShowSizeChange={handleSizeChange} // Handle size change event
          style={{ marginTop: "20px", textAlign: "center" }}
          showSizeChanger={true}
          showQuickJumper={false}
        />
      </div>
      {User.role != "teacher" && (
        <Tooltip placement="left" title="Add Video">
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
          ></FloatButton.Group>
        </Tooltip>
      )}
    </div>
    // </ContentWrapper>
  );
};

export default Video;
