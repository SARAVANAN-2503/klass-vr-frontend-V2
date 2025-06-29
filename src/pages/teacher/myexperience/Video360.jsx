import React, { useEffect, useRef, useState } from "react";
import {
  Col,
  Collapse,
  Row,
  Typography,
  Spin,
  Card,
  Pagination,
  Input,
  Select,
  Upload,
  Form,
  Divider,
  Badge,
  Space,
  Radio,
  Image,
  message,
  ConfigProvider,
} from "antd";
import { Button, Modal } from "antd";
import { GetTeacherVideoTag, GetVideo, PostVideo } from "../../../services/Index";
import TextArea from "antd/es/input/TextArea";
import { EyeOutlined, LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import "./style.css";
import ReactPlayer from "react-player";
import subjectOptions from "../../../json/subject";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import rightArrow from "../../../assets/icons/right-arrow.svg";
import searchIcon from "../../../assets/icons/search.svg";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/config/redux";
import { MdDeleteOutline } from "react-icons/md";
import ThemeConfig from "../../../utils/ThemeConfig";
import MonoscopicImg from "../../../assets/samplepicture/Monoscopic.png";
import StereoscopicSideToSide from "../../../assets/samplepicture/StereoscopicSideToSide.png";
import StereoscopicTopToBottom from "../../../assets/samplepicture/StereoscopicTopToBottom.png";

// Use the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
const Video360 = ({
  content,
  _edit,
  addLoader,
  setContent,
  handleBack,
  handleClose,
  handleSave,
  videoPlayerRef,
  setActiveKey,
}) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const format = "mm:ss";
  const [dataValue, setDataValue] = useState([
    {
      title: "",
      description: "",
      tags: [],
      videoFile: "",
      script: "",
      typeOfVideo: "stereoscopic-side-to-side",
    },
  ]);
  const optionsWithDisabled = [
    {
      label: "Local Video",
      value: "local",
    },
    {
      label: "Repo Video",
      value: "repo",
    },
    {
      label: "Youtube Video",
      value: "youtube",
    },
  ];
  const [value4, setValue4] = useState("");
  const style = {
    padding: "8px 0",
  };
  const imgStyle = {
    display: "block",
    width: "100%",
    height: 200,
  };
  const [searchValue, setSearchValue] = useState({
    title: "",
    tags: [],
  });

  const [req, setReq] = useState(true);
  const [req1, setReq1] = useState(true);
  const [youtubesubmit, setYoutubeSubmit] = useState(true);
  const [form] = Form.useForm();
  const [scriptReadingTime, setScriptReadingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const wordsPerMinute = 200;
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(
    content.videoDetails &&
      content.videoDetails.length > 0 &&
      content.videoDetails[0] &&
      content.videoDetails[0]?.videoDetail
      ? content.videoDetails[0]?.videoDetail.videoURL
      : null,
  );
  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours > 0 ? hours + " Hr " : ""}${minutes > 0 ? minutes + " Min " : ""}${seconds} Sec`;
  };
  const [YoutueVideoFlag, setYoutueVideoFlag] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const [youtubeVideo, setYoutubeVideo] = useState(content.youTubeUrl);
  const [loading, setLoading] = useState(false);
  const [showCollapse, setShowCollapse] = useState(content.videoDetails && content.videoDetails.length > 0);
  const [modelValue, setModelValue] = useState([]);
  const [open, setOpen] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [showYoutubeCollapse, setShowYoutubeCollapse] = useState(content.youTubeUrl != "" ? true : false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const pageSize = 10;
  const [tags, setTags] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [contentValue, setContentValue] = useState({
    script:
      content.videoDetails &&
      content.videoDetails.length > 0 &&
      content.videoDetails[0] &&
      content.videoDetails[0]?.script
        ? content.videoDetails[0]?.script
        : "",
    videoSound: content.videoDetails[0]?.videoSound ? content.videoDetails[0]?.videoSound : "",
    VideoId:
      content.videoDetails && content.videoDetails.length > 0 && content.videoDetails[0] && content.videoDetails[0]
        ? content.videoDetails[0]?.VideoId
        : "",
  });
  const scriptValue1 = contentValue.videoSound === "tts";
  const scriptValue = content.youTubeVideoAudio === true;
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
  const handleDelete = () => {
    setReq(true);
    setReq1(true);
    setDataValue([
      {
        title: "",
        description: "",
        tags: [],
        videoFile: "",
        script: "",
      },
    ]);

    setContent((prevContent) => ({
      ...prevContent,
      videoDetails: [],
      youTubeUrl: "",
      youTubeVideoScript: "",
      youTubeStartTimer: "",
      youTubeEndTimer: "",
    }));
    setYoutubeVideo(null);
    setValue4("");
    setContentValue({
      videoSound: "",
      script: "",
      VideoId: "",
    });
    setShowCollapse(false);
    setShowYoutubeCollapse(false);
    setVideoPreviewUrl(null);
  };
  const handleCancel = () => {
    setOpen(false);
    setValue4("");
  };
  const handleVideoSelect = (selectedVideo) => {
    setVideoPreviewUrl(selectedVideo.videoURL);
    const video = document.createElement("video");
    video.src = selectedVideo.videoURL;
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
    };

    let tempValue = contentValue;
    tempValue.VideoId = selectedVideo.id;
    setContentValue((prevContent) => ({
      ...prevContent,
      ...tempValue,
    }));

    setContent((prevContent) => ({
      ...prevContent,
      videoDetails: [tempValue],
    }));
    setShowCollapse(true);
    setOpenModel(false);
  };
  useEffect(() => {
    if (content && content.videoDetails.length > 0) {
      const video = document.createElement("video");
      video.src = content.videoDetails[0]?.videoDetail
        ? content.videoDetails[0]?.videoDetail.videoURL
        : content.videoDetails[0]?.videoURL;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
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

  const handleYoutubeVideo = (selectedVideo) => {
    setYoutueVideoFlag(false);
    setShowYoutubeCollapse(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Update current page
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
  const handleURLChange = (value, field) => {
    if (dayjs.isDayjs(value)) {
      const minutes = value.minute().toString().padStart(2, "0");
      const seconds = value.second().toString().padStart(2, "0");
      value = `${minutes}:${seconds}`;
    }

    if (field === "youTubeStartTimer") {
      setReq(false);
      const [minutes, seconds] = value.split(":").map(Number);

      if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
        message.error("Invalid time format");
        return;
      }

      const totalSeconds = minutes * 60 + seconds;
      let modifiedUrl = content.youTubeUrl;

      modifiedUrl = modifiedUrl.replace(/&?t=\d+/g, "");
      modifiedUrl += `&t=${totalSeconds}`;

      setContent((prevState) => ({
        ...prevState,
        // youTubeUrl: modifiedUrl,
        [field]: value,
      }));
    } else if (field === "youTubeEndTimer") {
      setReq1(false);
      setContent((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    } else {
      setContent((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    }
  };
  const handleRemovefile = (index) => {
    // Logic to handle file removal
    const updatedContent = [...dataValue];
    updatedContent[index] = {
      ...updatedContent[index],
      videoFile: null,
      readyToUpload: false,
    };
    setDataValue(updatedContent);
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearchValue((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleChangeOption = (value, field, index) => {
    const tempValue = { ...contentValue };
    tempValue[field] = value;
    setContentValue(tempValue);
    setContent((prevContent) => {
      return {
        ...prevContent,
        videoDetails: [tempValue],
      };
    });
  };

  const handleUpload = async () => {
    const file = dataValue[0].videoFile;

    const title = dataValue[0].title;
    const description = dataValue[0].description;
    const tags = dataValue[0].tags;

    const formData = new FormData();
    formData.append("videoFile", file);
    formData.append("title", title);
    formData.append("description", description);
    tags.forEach((tag) => formData.append("tags[]", tag.trim()));
    formData.append("typeOfVideo", dataValue[0].typeOfVideo);
    setLoading(true);
    try {
      const response = await PostVideo(formData);

      setVideoPreviewUrl(response.videoURL);
      setOpen(false);
      setShowCollapse(true);
      let tempValue = contentValue;
      tempValue.VideoId = response.id;
      setContentValue((prevContent) => ({
        ...prevContent,
        ...tempValue,
      }));

      setContent((prevContent) => ({
        ...prevContent,
        videoDetails: [tempValue],
      }));
      form.resetFields();
    } catch (error) {
      if (error.response.data.code == 500) {
        message.error("Unsupported file format.");
        return;
      }
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataValue[0].videoFile && dataValue[0].videoFile.type?.includes("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(dataValue[0].videoFile);
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        video.remove(); // Clean up the created video element
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
  }, [dataValue, setDataValue, wordsPerMinute, contentValue.script]);

  useEffect(() => {
    // Create a new object excluding empty key-value pairs
    const filteredSearchValue = Object.fromEntries(Object.entries(searchValue).filter(([key, value]) => value !== ""));

    if (Object.keys(filteredSearchValue).length > 0) {
      GetVideo(filteredSearchValue)
        .then((res) => {
          setVideoList(res.results);
        })
        .finally(() => {
          setLoadingVideos(false); // Update loading state after fetching videos
        });
    } else {
      GetVideo()
        .then((res) => {
          setVideoList(res.results);
        })
        .finally(() => {
          setLoadingVideos(false); // Update loading state after fetching videos
        });
    }
    GetTeacherVideoTag().then((res) => {
      const formattedTags = res.map((tag) => ({
        label: tag,
        value: tag,
      }));
      setTags(formattedTags);
    });
  }, [searchValue]);

  const handleFile = (file) => {
    const updatedContent = [...dataValue];
    updatedContent[0] = {
      ...updatedContent[0],
      videoFile: file,
      readyToUpload: true,
    };
    setDataValue(updatedContent);
  };
  const handleModelClick = (item) => {
    setModelValue(item);
  };
  const handleYoutubePaste = (value) => {
    setYoutubeVideo(value);
    setYoutubeSubmit(false);
  };
  const handleVisibilityChange = () => {
    const player = document.querySelector(".react-player > video");
    if (player) {
      if (document.visibilityState === "hidden") {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  const validateTimes = (_, value) => {
    const startTime = dayjs(content.youTubeStartTimer, "mm:ss");
    const endTime = dayjs(content.youTubeEndTimer, "mm:ss");

    if (startTime.isSameOrAfter(endTime)) {
      return Promise.reject("Start time must be less than end time and cannot be the same.");
    }
    return Promise.resolve();
  };
  const items = [
    {
      key: "1",
      label: "360 Video",
      children: (
        <>
          <Form
            name="basic"
            initialValues={{
              remember: true,
              script:
                content.videoDetails &&
                content.videoDetails.length > 0 &&
                content.videoDetails[0] &&
                content.videoDetails[0]?.script
                  ? content.videoDetails[0]?.script
                  : "",
              videoSound: content.videoDetails[0]?.videoSound ? content.videoDetails[0]?.videoSound : "",
            }}
            onFinish={handleSave}
            autoComplete="off"
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Video Sound"
                  name="videoSound"
                  rules={[
                    {
                      required: true,
                      message: "Please select videoSound!",
                    },
                  ]}
                >
                  <Radio.Group
                    onChange={(e) => handleChangeOption(e.target.value, "videoSound", 0)}
                    value={contentValue.videoSound}
                    size="large"
                  >
                    <Radio value="tts">Script Audio </Radio>
                    <Radio value="mute">360 Video Audio</Radio>
                  </Radio.Group>
                </Form.Item>
                <Divider />
                <Form.Item
                  label="Script"
                  name="script"
                  rules={[
                    {
                      required: contentValue.videoSound === "tts",
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
                    disabled={!scriptValue1}
                    onChange={(e) => handleChangeOption(e.target.value, "script", 0)}
                    placeholder="Please enter your Video script"
                    autoSize={{ minRows: 11, maxRows: 11 }}
                    className="mb-2"
                  />
                </Form.Item>

                <Divider />
                <div className="flex items-center justify-between mt-3">
                  <Typography className="text-left">
                    <span className="flex items-center justify-start gap-4">
                      Reading Time{" "}
                      <span className="bg-black px-8 py-2 rounded-full text-[#fff]">
                        {scriptReadingTime.minutes} min(s)
                      </span>
                    </span>
                  </Typography>
                  <Typography className="text-left">
                    <span className="flex items-center justify-start gap-4">
                      Video Duration{" "}
                      <span className="bg-black px-8 py-2 rounded-full text-[#fff]">
                        {formatDuration(videoDuration)}
                      </span>
                    </span>
                  </Typography>
                  {/* <div className="flex gap-4">
                    <Col span={24} className="flex gap-2 items-center">
                      <Typography>Video Duration :</Typography>
                      <Badge count={formatDuration(videoDuration)} />
                    </Col>
                  </div> */}
                </div>
              </Col>
              <Col span={12}>
                {videoPreviewUrl && (
                  <>
                    <Col span={24}>
                      {/* <Typography>Video Preview:</Typography> */}
                      <video controls style={{ width: "100%" }} ref={videoPlayerRef}>
                        <source src={videoPreviewUrl} type="video/mp4" />
                      </video>
                      {/* <ReactPlayer
                        ref={videoPlayerRef}
                        url={videoPreviewUrl}
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={false} // Always set to true to ensure video plays
                        className="react-player" // Added class for styling
                      /> */}
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
                    onClick={() => handleDelete(0)}
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
                  <Button
                    type="primary"
                    className="mr-5"
                    onClick={() => {
                      if (videoPlayerRef.current) {
                        videoPlayerRef.current.pause(); // Pause the video
                      }
                      handleBack("2");
                    }}
                  >
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
  useEffect(() => {
    form.setFieldsValue({
      youTubeVideoScript: content.youTubeVideoAudio ? content.youTubeVideoScript : null,
    });
    form.validateFields(["youTubeVideoScript"]);
  }, [content.youTubeVideoAudio]);

  const youtubeItems = [
    {
      key: "1",
      label: "Youtube Video",
      children: (
        <>
          <Form
            name="basic"
            initialValues={{
              remember: true,
              youTubeVideoAudio: content.youTubeVideoAudio,
              youTubeVideoScript: content.youTubeVideoAudio === true ? content.youTubeVideoScript : null,
              youTubeStartTimer: content.youTubeStartTimer,
              youTubeEndTimer: content.youTubeEndTimer,
            }}
            onFinish={handleSave}
            autoComplete="off"
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <div className="video-player-container">
                  <ReactPlayer
                    ref={videoPlayerRef}
                    url={youtubeVideo}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false} // Always set to true to ensure video plays
                    className="react-player" // Added class for styling
                  />
                </div>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Video Sound"
                  name="youTubeVideoAudio"
                  rules={[
                    {
                      required: true,
                      message: "Please select youTubeVideoAudio!",
                    },
                  ]}
                >
                  <Radio.Group
                    onChange={(e) => handleURLChange(e.target.value, "youTubeVideoAudio")}
                    value={content.youTubeVideoAudio}
                  >
                    <Radio value={true}>Script Audio</Radio>
                    <Radio value={false}>Youtube Audio</Radio>
                  </Radio.Group>
                </Form.Item>
                <Divider />
                <Form.Item
                  label="Script"
                  name="youTubeVideoScript"
                  rules={[
                    {
                      required: content.youTubeVideoAudio === true,
                      message: "Please enter your character script!",
                    },
                    {
                      min: 5,
                      message: "Character script must be at least 5 characters!",
                    },
                  ]}
                >
                  <Input.TextArea
                    name="youTubeVideoScript"
                    value={content.youTubeVideoAudio === true ? content.youTubeVideoScript : null}
                    disabled={!scriptValue}
                    onChange={(e) => handleURLChange(e.target.value, "youTubeVideoScript")}
                    placeholder="Please enter your Video script"
                    autoSize={{ minRows: 11, maxRows: 11 }}
                    className="mb-2"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: "16px" }}>
              <Col span={12}>
                <Form.Item
                  label="Start Time"
                  name="youTubeStartTimer"
                  rules={[{ required: req, message: "Please select Start Time!" }, { validator: validateTimes }]}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      ampm={false} // Hide AM/PM
                      value={dayjs(content.youTubeStartTimer, "mm:ss")}
                      onChange={(time) => handleURLChange(time, "youTubeStartTimer")}
                      views={["minutes", "seconds"]}
                      format="mm:ss"
                      minutesStep={1}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="End Time"
                  name="youTubeEndTimer"
                  rules={[{ required: req1, message: "Please select End Time!" }, { validator: validateTimes }]}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={dayjs(content.youTubeEndTimer, "mm:ss")}
                      onChange={(time) => handleURLChange(time, "youTubeEndTimer")}
                      views={["minutes", "seconds"]}
                      format="mm:ss"
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Form.Item>
              </Col>
            </Row>
            {/* <Row>
              <Col span={24}> */}
            <div className="fixed top-[24px] right-[30px]">
              <Button
                className="bg-[#fff] text-[#000]"
                icon={<MdDeleteOutline />}
                type="primary"
                size="large"
                danger
                onClick={() => handleDelete(0)}
              ></Button>
            </div>
            {/* </Col>
            </Row> */}
            <Col span={24}>
              <div className="mt-5 flex justify-end">
                <Button type="default" className="mr-5" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  type="primary"
                  className="mr-5"
                  onClick={() => {
                    if (videoPlayerRef.current) {
                      const internalPlayer = videoPlayerRef.current.getInternalPlayer();
                      if (internalPlayer && typeof internalPlayer.pauseVideo === "function") {
                        internalPlayer.pauseVideo(); // Use YouTube API's pauseVideo method
                      } else if (internalPlayer && typeof internalPlayer.pause === "function") {
                        internalPlayer.pause(); // Use HTML5 video element's pause method
                      }
                    }
                    handleBack("2");
                  }}
                >
                  Back
                </Button>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save & Next
                  </Button>
                </Form.Item>
              </div>
            </Col>
          </Form>
        </>
      ),
    },
  ];

  const onChange4 = ({ target: { value } }) => {
    setValue4(value);
    switch (value) {
      case "local":
        setOpen(true);
        break;
      case "repo":
        setOpenModel(true);
        break;
      case "youtube":
        setYoutueVideoFlag(true);
        break;
      default:
        break;
    }
  };

  const handleCloseModal = () => {
    setYoutueVideoFlag(false);
    setOpenModel(false);
    setYoutubeVideo(null);
    setShowYoutubeCollapse(false);
    setValue4(""); // Clear the input value
    setContent((prevState) => ({
      ...prevState,
      youTubeUrl: "", // Clear the youTubeUrl field
    }));
    setYoutubeVideo(null);
    if (videoPlayerRef.current) {
      const internalPlayer = videoPlayerRef.current.getInternalPlayer();
      if (internalPlayer && typeof internalPlayer.pauseVideo === "function") {
        internalPlayer.pauseVideo(); // Use YouTube API's pauseVideo method
      } else if (internalPlayer && typeof internalPlayer.pause === "function") {
        internalPlayer.pause(); // Use HTML5 video element's pause method
      }
    }
  };
  const options = [];
  return (
    <Spin spinning={addLoader}>
      {showCollapse ? (
        <Collapse defaultActiveKey={["1"]} accordion items={items} />
      ) : showYoutubeCollapse ? (
        <Collapse defaultActiveKey={["1"]} accordion items={youtubeItems} />
      ) : (
        <>
          <div className="inner-glass-card">
            <p className="header-text font-[700] text-[24px]">360 Video</p>
            <Radio.Group
              options={optionsWithDisabled}
              onChange={onChange4}
              value={value4}
              optionType="button"
              buttonStyle="solid"
              className="video_360_buttons"
            />
          </div>
          {!_edit && (
            <div className="flex justify-start gap-4 mt-8 ml-4">
              {/* <Button type="default" className="mr-5" onClick={handleClose}>
                Close
              </Button> */}
              <Button
                type="primary"
                className="rounded-full bg-black"
                size="large"
                onClick={() => {
                  if (videoPlayerRef.current) {
                    const internalPlayer = videoPlayerRef.current.getInternalPlayer();
                    if (internalPlayer && typeof internalPlayer.pauseVideo === "function") {
                      internalPlayer.pauseVideo(); // Use YouTube API's pauseVideo method
                    } else if (internalPlayer && typeof internalPlayer.pause === "function") {
                      internalPlayer.pause(); // Use HTML5 video element's pause method
                    }
                  }
                  handleBack("2");
                }}
              >
                Previous
              </Button>
              <Button type="primary" onClick={() => setActiveKey("4")} size="large" className="form-button skip-button">
                Skip
              </Button>
            </div>
          )}
        </>
      )}
      <ConfigProvider theme={ThemeConfig.light}>
        {/* local video */}
        <Modal
          width={600}
          open={open}
          onCancel={handleCancel}
          footer={null}
          className={`custom-close-button ${selectedTheme === "dark" ? "custom-modal" : ""}`}
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
              // onFinishFailed={handleCancel}
              autoComplete="off"
              form={form}
            >
              <Typography className="text-left text-sm uppercase  mt-3 mb-1">Title</Typography>
              <Form.Item
                name={`title-${0}`}
                rules={[
                  {
                    required: true,
                    message: "Please input your Title!",
                  },
                ]}
              >
                <Input
                  className=" p-3"
                  placeholder="Please enter the Title"
                  onChange={(e) => handleChange(e.target.value, "title", 0)}
                />
              </Form.Item>
              {/* <Typography className="text-left uppercase  mb-1">
              Tag
            </Typography>
            <Form.Item
              name={`tags-${0}`}
              rules={[
                {
                  required: true,
                  message: "Please Add tags!",
                },
              ]}
            >
              <Select
                allowClear
                mode="tags"
                placeholder="Please enter the tags"
                style={{
                  width: "100%",
                }}
                className="custom-select-css"
                name="tags"
                onChange={(value) => handleChange(value, "tags", 0)}
              >
                {options.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
              <Typography className="text-left uppercase  mb-1">Description</Typography>
              <Form.Item
                name={`description-${0}`}
                rules={[
                  {
                    required: true,
                    message: "Please Enter description!",
                  },
                ]}
              >
                <TextArea
                  className=" resize-none p-3"
                  placeholder="Please enter the description"
                  onChange={(e) => handleChange(e.target.value, "description", 0)}
                />
              </Form.Item>

              <div className="w-full h-30 border-dashed rounded-md flex justify-center border-gray-200 pt-5 mb-2">
                <Form.Item name={`videoFile-${0}`} rules={[{ required: true, message: "Please Enter videoFile!" }]}>
                  <Upload
                    name={`videoFile-${0}`}
                    listType="picture"
                    beforeUpload={(file) => {
                      handleFile(file);
                      return false;
                    }}
                    maxCount={1}
                    accept=".mp4,.mov,.mkv,.avi"
                    onRemove={() => handleRemovefile(0)}
                    fileList={dataValue[0].videoFile ? [dataValue[0].videoFile] : []}
                  >
                    {(dataValue[0].videoFile == "" || dataValue[0].videoFile == null) && (
                      <Button className=" border-none rounded-md">
                        Upload <UploadOutlined />
                      </Button>
                    )}
                  </Upload>
                </Form.Item>
              </div>
              <Typography className="text-left text-gray-500 text-[12px] mb-0 pl-2">
                Note: Upload 360 Video only
              </Typography>
              <Typography className="text-left uppercase  relative top-5 mb-0">Type of Video</Typography>
              <Row size={24} className="flex mt-0">
                <Radio.Group
                  value={dataValue[0].typeOfVideo}
                  onChange={(e) => handleChange(e.target.value, "typeOfVideo", 0)}
                  className="flex p-0"
                >
                  <Radio value={"stereoscopic-side-to-side"} className="flex flex-col-reverse gap-3 w-[172px]">
                    <Image src={StereoscopicSideToSide} width={170} height={113} />
                    <Typography className="text-center mb-0 capitalize">stereoscopic side-side</Typography>
                  </Radio>
                  <Radio value={"stereoscopic-top-to-bottom"} className="flex flex-col-reverse gap-3 w-[172px]">
                    <Image src={StereoscopicTopToBottom} width={170} height={113} />
                    <Typography className="text-center mb-0 capitalize">stereoscopic top-bottom</Typography>
                  </Radio>
                  <Radio value={"monoscopic"} className="flex flex-col-reverse gap-3 w-[172px]">
                    <Image src={MonoscopicImg} width={170} height={113} />
                    <Typography className="text-center mb-0 capitalize">monoscopic</Typography>
                  </Radio>
                </Radio.Group>
              </Row>
              <Form.Item
                wrapperCol={{
                  offset: 10,
                  span: 16,
                }}
                className="mt-5"
              >
                <Button type="primary" className="rounded-xl" size="large" loading={loading} htmlType="submit">
                  Submit <img src={rightArrow} alt="right arrow" width="18px" />
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>

        {/* repo video */}
        <Modal
          open={openModel}
          onCancel={() => {
            setSearchValue({
              title: "",
              tags: [],
            });
            setOpenModel(false);
            setValue4("");
          }}
          className="custom-close-button custom-modal"
          footer={null}
          width={1012}
        >
          <div className="py-5 px-3">
            <div className="flex flex-col items-center justify-between p-4">
              <Typography className="text-xl pt-3 m-0">Select Video</Typography>
              <div className="flex items-center justify-between mt-7">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search the model, tags"
                    className="w-[420px] p-3 border-none rounded-xl"
                    value={searchValue.title}
                    name="title"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch(e)}
                  />
                </div>
              </div>
            </div>
            {loadingVideos ? (
              <div style={{ textAlign: "center" }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex gap-4 overflow-hidden my-4">
                  {videoList.map((val, index) => (
                    <div style={style} key={index}>
                      <Card
                        hoverable
                        onClick={() => handleVideoSelect(val)}
                        className="h-[280px] w-[400px] flex flex-col border-gray-300 ml-4"
                      >
                        <img alt="thumbnailUrl" src={val.thumbnail} style={imgStyle} className="rounded-lg" />
                        <div className="flex justify-between mt-3">
                          <Typography className="font-bold">{val.title}</Typography>
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleModelClick(val)}
                          />
                        </div>
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

        {/* youtube video */}
        <Modal
          open={YoutueVideoFlag}
          className="custom-close-button"
          onCancel={handleCloseModal}
          footer={null}
          width={800}
        >
          <div className="p-5">
            <Typography className="text-xl p-4 m-0">Select Youtube URL Video</Typography>
            <Input
              name="youTubeUrl"
              placeholder="Please enter the Youtube Url"
              value={content.youTubeUrl}
              prefix={<SearchOutlined />}
              onChange={(e) => handleURLChange(e.target.value, "youTubeUrl", 0)}
              onPaste={(e) => handleYoutubePaste(e.clipboardData.getData("text"))} // Handle paste event
              className="mb-10 p-[10px]"
            />
            <Col span={24}>
              <div className="video-player-container">
                <ReactPlayer
                  ref={videoPlayerRef}
                  url={youtubeVideo}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={false} // Always set to true to ensure video plays
                  className="react-player" // Added class for styling
                />
              </div>
            </Col>
            <Col span={24}>
              <div className="mt-5 flex justify-end">
                <Button type="default" className="mr-5" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button
                  type="primary"
                  disabled={youtubesubmit}
                  onClick={() => {
                    if (videoPlayerRef.current) {
                      const internalPlayer = videoPlayerRef.current.getInternalPlayer();
                      if (internalPlayer && typeof internalPlayer.pauseVideo === "function") {
                        internalPlayer.pauseVideo(); // Use YouTube API's pauseVideo method
                      } else if (internalPlayer && typeof internalPlayer.pause === "function") {
                        internalPlayer.pause(); // Use HTML5 video element's pause method
                      }
                    }
                    handleYoutubeVideo(youtubeVideo);
                  }}
                  htmlType="submit"
                >
                  Select Video
                </Button>
              </div>
            </Col>
          </div>
        </Modal>
      </ConfigProvider>
    </Spin>
  );
};
export default Video360;
