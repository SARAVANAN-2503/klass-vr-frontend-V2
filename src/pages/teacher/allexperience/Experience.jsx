import {
  Badge,
  Row,
  Button,
  Card,
  Popconfirm,
  Divider,
  Form,
  Modal,
  Select,
  Space,
  Tooltip,
  message,
  Typography,
  Col,
  Avatar,
  Spin,
  Input,
  Image,
  Checkbox,
  ConfigProvider,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import subjectOptions from "../../../json/subject";
import ExperienceTable from "./ExperienceTable";
import { HiChevronLeft } from "react-icons/hi2";
import {
  DeploySession,
  GetGrades,
  GetMyExperience,
  PostExperienceContected,
  StartSchool,
  StopSchool,
  SyncSchool,
  GradeSectionFilter, // Import the function here
  LiveStatusDevice,
  PatchExperienceContected,
} from "../../../services/Index";
import { useSelector } from "react-redux";
import ContentWrapper from "../../../components/ContentWrapper";
import { FaRegCircleStop } from "react-icons/fa6";

import modal1 from "../../../assets/deploy/model-3.png";
import modal2 from "../../../assets/deploy/model-1.png";
import vrActive from "../../../assets/deploy/vr-active.png";
import vrInactive from "../../../assets/deploy/vr-inactive.png";
import vrgActive from "../../../assets/deploy/vrg-active.png";
import vrgInactive from "../../../assets/deploy/vrg-inactive.png";
import vrgCompleted from "../../../assets/deploy/vrg-completed.png";
import vrglasses from "../../../assets/deploy/vrglasses.png";
import searchIcon from "../../../assets/icons/search.svg";

import { HiArrowNarrowRight } from "react-icons/hi";
import { MdChevronRight } from "react-icons/md";
import { setSelectedMenu } from "../../../store/themeSlice";
import ThemeConfig from "../../../utils/ThemeConfig";
const { Meta } = Card;
const Experience = () => {
  const User = useSelector((state) => state.auth.auth);
  const [experience, setExperience] = useState([]);
  const [form] = Form.useForm();
  const [selectedValue, setSelectedValue] = useState(null);
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deployStep, setDeployStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [deployModal, setDeployModal] = useState(false);
  const [deployModalStep2, setDeployModalStep2] = useState(false);
  const [deployModalStep3, setDeployModalStep3] = useState(false);
  const [IsActive, setIsActive] = useState(false);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [deployedOpen, setDeployedOpen] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deployButtonLoading, setDeployButtonLoading] = useState(false);
  const nav = useNavigate();
  const [start, setStart] = useState(false);
  const [onlineDevices, setOnlineDevices] = useState([]);
  const [offlineDevices, setOfflineDevices] = useState([]);
  const [totalActive, setTotalActive] = useState([]);
  const ExpereinceConductedID = localStorage.getItem("expereinceConductedID");
  const [userCompleteStop, setUserCompleteStop] = useState(false);
  const [completedSyncedDevices, setCompletedSyncedDevices] = useState([]);
  const SessionName = localStorage.getItem("headers");
  const [afterStart, setAfterStart] = useState(false);
  const [uniqueGrades, setUniqueGrades] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [filteredExperience, setFilteredExperience] = useState([]); // Filtered data to display
  const [searchAllValue, setSearchAllValue] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const imgStyle = {
    display: "block",
    width: "90%",
    height: 60,
    marginBottom: "10px",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const devices = await SyncSchool();
        if (devices) {
          processDevices(devices);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, [User.schoolId]);

  const processDevices = (devices) => {
    let online = [];
    let offline = [];
    let completedSynced = [];
    devices.forEach((device) => {
      if (device.isActive) {
        const deviceElement = (
          <Col
            key={device.deviceId}
            className="gutter-row"
            xs={12}
            sm={10}
            md={7}
            lg={5}
            xl={3}
          >
            <Card
              style={{
                width: 120,
                marginTop: 16,
              }}
            >
              <Meta
                avatar={<Avatar src={vrglasses} />}
                description={
                  <Badge
                    status={device.isSynced ? "success" : "error"}
                    text={device.deviceId}
                  />
                }
              />
            </Card>
          </Col>
        );
        device.isSynced
          ? online.push(deviceElement)
          : offline.push(deviceElement);
        if (device.isCompleted && device.isSynced) {
          completedSynced.push(device);
        }
      }
    });
    setOnlineDevices(online);
    setOfflineDevices(offline);
    const allSyncCount = online.length;
    const deviceCount = online.length + offline.length;
    setTotalActive(allSyncCount);
    if (allSyncCount === deviceCount && allSyncCount != 0 && deviceCount != 0) {
      setStart(true);
    }
    setUserCompleteStop(devices.every((device) => !device.isCompleted));
    setCompletedSyncedDevices(completedSynced);
  };

  const handleStart = async () => {
    const data = {
      isStart: true,
      isStop: false,
      experienceId: ExpereinceConductedID,
      gradeId: localStorage.getItem("currentgradeId"),
      sectionId: localStorage.getItem("currentsectionId"),
    };
    await LiveStatusDevice(data);
    setAfterStart(true);
  };

  const handleCurrentStop = async () => {
    const data = { isStart: false, isStop: true };
    await LiveStatusDevice(data);
    await StopSchool();
    localStorage.removeItem("headers");
    localStorage.removeItem("CurrentsessionId");
    nav("/experienceList", { replace: true });
    dispatch(setSelectedMenu("/experienceList"));
  };

  const handleCurrentStopValue = async () => {
    const startTime = new Date(localStorage.getItem("currentStartTime"));
    const endTime = new Date();
    const timeDiffInMilliseconds = endTime - startTime;
    const classConductedHours = timeDiffInMilliseconds / (1000 * 60 * 60);
    const data = {
      classEndTime: new Date().toISOString(),
      totalStudentsAttended: totalActive,
      totalDevicesActive: totalActive,
      classConductedHours: classConductedHours.toFixed(2),
      feedback: "Not Completed",
    };
    try {
      const res = await PatchExperienceContected(ExpereinceConductedID, data);
      const data1 = {
        isStart: false,
        isStop: true,
        experienceId: res.id,
        gradeId: localStorage.getItem("currentgradeId"),
        sectionId: localStorage.getItem("currentsectionId"),
      };
      await LiveStatusDevice(data1);
      await StopSchool();
      nav("/experienceList", { replace: true });
      dispatch(setSelectedMenu("/experienceList"));
    } catch (error) {
      console.error("Error posting experience:", error);
    }
  };

  const handleStop = async () => {
    const startTime = new Date(localStorage.getItem("currentStartTime"));
    const endTime = new Date();
    const timeDiffInMilliseconds = endTime - startTime;
    const classConductedHours = timeDiffInMilliseconds / (1000 * 60 * 60);
    const data = {
      classEndTime: new Date().toISOString(),
      totalStudentsAttended: totalActive,
      totalDevicesActive: totalActive,
      classConductedHours: classConductedHours.toFixed(2),
      feedback: "Completed",
    };
    try {
      const res = await PatchExperienceContected(ExpereinceConductedID, data);
      const data1 = {
        isStart: false,
        isStop: true,
        experienceId: res.id,
        gradeId: localStorage.getItem("currentgradeId"),
        sectionId: localStorage.getItem("currentsectionId"),
      };
      await LiveStatusDevice(data1);
      await StopSchool();
      message.success("Experience completed successfully");
      nav("/experienceList", { replace: true });
      dispatch(setSelectedMenu("/experienceList"));
    } catch (error) {
      console.error("Error posting experience:", error);
    }
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
  };
  const handleSearch = (e) => {
    const { name, value } = e.target;

    setSearchValue((state) => ({
      ...state,
      [name]: value,
    }));
  };

  const handleDeploy = async (values) => {
    const gradeID = form.getFieldValue("gradeId");
    const sectionID = form.getFieldValue("sectionId");
    if (deployStep === 1) {
      setSelectedGrade(gradeID);
      setDeployStep(2);
    } else {
      // Step 2: Grade and section are both selected, deploy
      try {
        setDeployButtonLoading(true);
        localStorage.setItem("currentStartTime", new Date().toISOString());
        localStorage.setItem("currentgradeId", gradeID);
        localStorage.setItem("currentsectionId", sectionID);
        localStorage.setItem("CurrentsessionId", selectedValue);
        await DeploySession(selectedValue).then(() => {
          message.success("Deployed Successfully!");
          setSelectedValue(null);
          setDeployModal(false);
          setIsActive(true);
          setDeployModalStep2(true);
          handleRefresh();
        });
        form.resetFields();
        const data = {
          sessionID: selectedValue,
          classStartTime: new Date().toISOString(),
          conductedDate: new Date().toISOString(),
          sectionID: sectionID,
          gradeID: gradeID,
        };
        const res = await PostExperienceContected(data);
        localStorage.setItem("expereinceConductedID", res.id),
          setTimeout(async () => {
            try {
              await StartSchool();
            } catch (err) {
              message.error(err.response.data.message);
            }
          }, 2000);
      } catch (err) {
        message.error(err.response.data.message);
      } finally {
        setDeployButtonLoading(false);
      }
    }
  };

  const handleView = (id) => {
    nav(`/viewexperience/${id}`);
  };

  const handleClose = () => {
    setDeployModalStep3(true);
    setDeployModal(false);
    setSelectedValue(null);
    setDeployModalStep2(false);
    form.resetFields();
  };

  const handleGradeChange = async (gradeId) => {
    try {
      form.setFieldsValue({ gradeId: gradeId });
      const response = await GradeSectionFilter(gradeId);
      setSections(response); // Assuming the response structure
      form.setFieldsValue({ sectionId: undefined });
      handleDeploy();
    } catch (err) {
      console.log(err);
      message.error("Error fetching sections");
    }
  };
  const handleSectionChange = async (sectionID) => {
    try {
      form.setFieldsValue({ sectionId: sectionID });
      setDeployModal(false);
      handleDeploy();
    } catch (err) {
      console.log(err);
      message.error("Error fetching sections");
    }
  };

  useEffect(() => {
    if (IsActive) {
      const fetchData = async () => {
        try {
          const devices = await SyncSchool();
          if (devices) {
            if (User.schoolId === devices[0].schoolId) {
              let activeCount = 0;
              let inactiveCount = 0;
              devices.forEach((device) => {
                if (device.isActive) {
                  activeCount++;
                } else {
                  inactiveCount++;
                }
              });
              setOnlineCount(activeCount);
              if (activeCount != 0) {
                setDisabled(true);
              }
              setOfflineCount(inactiveCount);
              setTotalCount(devices.length);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();

      const intervalId = setInterval(fetchData, 5000);

      return () => clearInterval(intervalId);
    }
  }, [User.schoolId, totalCount, IsActive]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const gradeResponse = await GetGrades();
        setGrades(gradeResponse);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        message.error(
          error.response ? error.response.data.message : "Error fetching data"
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setDeployedOpen(false);
    GetMyExperience(searchValue)
      .then((res) => {
        const deployedItems = res.filter((item) => item.isDeployed === true);
        const nonDeployedItems = res.filter((item) => item.isDeployed !== true);
        const sortedExperience = deployedItems.concat(nonDeployedItems);
        const hasDeployedItems = deployedItems.length > 0;
        setDeployedOpen(hasDeployedItems);
        setExperience(
          sortedExperience.map((item) => {
            return {
              ...item,
              key: item.id,
            };
          })
        );
        const grades = [...new Set(res.map((item) => item.grade))].map(
          (grade) => ({
            label: grade,
            value: grade,
          })
        );
        setUniqueGrades(grades);
        setLoading(false);
      })
      .catch((err) => {
        let errRes = err.response.data;
        if (errRes.code == 401) {
          console.log("401");
        } else {
          message.error(err.response.data.message);
          setLoading(false);
        }
      });
  }, [refresh, searchValue]);

  const onRoute = () => {
    nav("/AddExperience", { replace: true });
  };
  const onSocketModel = () => {
    // nav("/deviceconnect", {
    //   state: {
    //     SessionName: header,
    //   },
    //   replace: true,
    // });
    setDeployModalStep3(true);
  };
  const setDeployedDeactive = async () => {
    try {
      setLoading(true);

      // Assuming StopSchool is an asynchronous function
      await StopSchool();
      localStorage.setItem("expereinceConductedID", null), setIsActive(false);
      setRefresh((prevRefresh) => !prevRefresh);
      await handleRefresh(); // Assuming handleRefresh is asynchronous
      setDeployModalStep2(false);
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setLoading(false);
    }
  };
  const OpenLiveClass = () => {
    // nav("/deviceconnect");
    setDeployModalStep3(true);
  };

  const handleAllSearch = (event) => {
    setSearchAllValue(event.target.value);
  };
  useEffect(() => {
    const applyFilters = () => {
      const query = searchAllValue.toLowerCase();

      const filtered = experience.filter((item) =>
        Object.values(item).some(
          (value) => value && value.toString().toLowerCase().includes(query)
        )
      );

      setFilteredExperience(filtered);
    };

    applyFilters();
  }, [searchAllValue, experience]);
  const handleChangeCheck = (grades) => {
    setSelectedGrades(grades);
  };

  const handleSubjectChange = (subjects) => {
    setSelectedSubjects(subjects);
  };
  const uniqueSubjects = [
    ...new Set(experience.map((item) => item.subject)),
  ].map((subject) => ({ label: subject, value: subject }));
  useEffect(() => {
    const applyFilters = () => {
      const query = searchValue.toLowerCase();

      const filtered = experience.filter((item) => {
        const matchesSearch = Object.values(item).some(
          (value) => value && value.toString().toLowerCase().includes(query)
        );
        const matchesGrade =
          selectedGrades.length === 0 || selectedGrades.includes(item.grade);
        const matchesSubject =
          selectedSubjects.length === 0 ||
          selectedSubjects.includes(item.subject);

        return matchesSearch && matchesGrade && matchesSubject;
      });

      setFilteredExperience(filtered);
    };

    applyFilters();
  }, [searchValue, selectedGrades, selectedSubjects, experience]); // Update whenever filters or data change

  return (
    <>
      <ContentWrapper
        header="Experience"
        extra={
          <div>
            <div className="flex gap-4">
              <Input
                showSearch
                placeholder="Search"
                className="border-none rounded-xl"
                prefix={<SearchOutlined />}
                style={{ minWidth: "180px" }}
                onChange={handleAllSearch}
                value={searchAllValue}
              />
              <Select
                mode="multiple"
                showArrow
                placeholder="Filter"
                allowClear
                className="filter-select"
                style={{ minWidth: "270px", margin: "0 8px" }}
                value={selectedGrades}
                onChange={handleChangeCheck}
                dropdownRender={() => (
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <h4>Grade</h4>
                      {uniqueGrades.map((grade) => (
                        <div key={grade.value} style={{ padding: "4px 12px" }}>
                          <Checkbox
                            checked={selectedGrades.includes(grade.value)}
                            onChange={(e) => {
                              const newSelectedGrades = e.target.checked
                                ? [...selectedGrades, grade.value]
                                : selectedGrades.filter(
                                    (g) => g !== grade.value
                                  );
                              handleChangeCheck(newSelectedGrades);
                            }}
                          >
                            {grade.label}
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4>Subject</h4>
                      {uniqueSubjects.map((subject) => (
                        <div key={subject.value} style={{ padding: "4px 0" }}>
                          <Checkbox
                            checked={selectedSubjects.includes(subject.value)}
                            onChange={(e) => {
                              const newSelectedSubjects = e.target.checked
                                ? [...selectedSubjects, subject.value]
                                : selectedSubjects.filter(
                                    (s) => s !== subject.value
                                  );
                              handleSubjectChange(newSelectedSubjects);
                            }}
                          >
                            {subject.label}
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
              <Tooltip placement="top" title="Live Class">
                <Button
                  type="primary"
                  disabled={!deployedOpen}
                  onClick={OpenLiveClass}
                  className="filter-button"
                >
                  <span className="icon">
                    <svg
                      width="18"
                      height="12"
                      viewBox="0 0 18 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11.9498 9.78369C11.7859 9.78317 11.6258 9.73435 11.4895 9.64332C11.3532 9.55229 11.2468 9.42309 11.1836 9.2719C11.1203 9.1207 11.1031 8.95422 11.134 8.79327C11.1649 8.63232 11.2425 8.48406 11.3573 8.36702C11.9823 7.73894 12.3331 6.88892 12.3331 6.00285C12.3331 5.11678 11.9823 4.26677 11.3573 3.63869C11.2061 3.48071 11.1231 3.26965 11.1261 3.05103C11.1292 2.83241 11.218 2.62374 11.3735 2.47001C11.529 2.31628 11.7386 2.22982 11.9573 2.22926C12.1759 2.2287 12.386 2.31409 12.5423 2.46702C13.4759 3.40698 13.9998 4.67804 13.9998 6.00285C13.9998 7.32767 13.4759 8.59872 12.5423 9.53869C12.4646 9.61662 12.3722 9.6784 12.2705 9.72045C12.1688 9.7625 12.0598 9.78399 11.9498 9.78369ZM6.6356 9.54285C6.79272 9.38747 6.88168 9.17604 6.88293 8.95507C6.88418 8.7341 6.79761 8.52168 6.64227 8.36452C6.01726 7.73644 5.66639 6.88642 5.66639 6.00035C5.66639 5.11428 6.01726 4.26427 6.64227 3.63619C6.7213 3.55884 6.78415 3.46653 6.82715 3.36464C6.87015 3.26276 6.89245 3.15334 6.89273 3.04275C6.89301 2.93216 6.87128 2.82262 6.8288 2.72052C6.78632 2.61842 6.72395 2.52579 6.64531 2.44804C6.56667 2.37028 6.47334 2.30896 6.37077 2.26764C6.26819 2.22632 6.15841 2.20583 6.04784 2.20736C5.93726 2.2089 5.82809 2.23242 5.7267 2.27658C5.62531 2.32073 5.53372 2.38461 5.45727 2.46452C4.52367 3.40448 3.99971 4.67554 3.99971 6.00035C3.99971 7.32517 4.52367 8.59622 5.45727 9.53619C5.61266 9.6933 5.82409 9.78226 6.04506 9.78351C6.26603 9.78476 6.47845 9.6982 6.6356 9.54285ZM15.1931 11.5595C16.5705 10.0355 17.333 8.05452 17.333 6.00035C17.333 3.94618 16.5705 1.96516 15.1931 0.441186C15.0448 0.277305 14.8375 0.179047 14.6167 0.168029C14.396 0.157012 14.1799 0.234136 14.016 0.382436C13.8521 0.530737 13.7539 0.738065 13.7429 0.95881C13.7318 1.17956 13.809 1.39564 13.9573 1.55952C15.0573 2.77704 15.6663 4.3595 15.6663 6.00035C15.6663 7.64121 15.0573 9.22367 13.9573 10.4412C13.809 10.6051 13.7318 10.8211 13.7429 11.0419C13.7539 11.2626 13.8521 11.47 14.016 11.6183C14.1799 11.7666 14.396 11.8437 14.6167 11.8327C14.8375 11.8217 15.0448 11.7234 15.1931 11.5595ZM3.9831 11.6179C4.14692 11.4696 4.24518 11.2624 4.25628 11.0418C4.26737 10.8211 4.1904 10.6051 4.04227 10.4412C2.94224 9.22367 2.33324 7.64121 2.33324 6.00035C2.33324 4.3595 2.94224 2.77704 4.04227 1.55952C4.1157 1.47837 4.17243 1.38356 4.20922 1.28049C4.24601 1.17742 4.26213 1.06811 4.25668 0.95881C4.25122 0.849508 4.22429 0.742351 4.17742 0.643456C4.13055 0.544562 4.06467 0.455867 3.98352 0.382436C3.90237 0.309006 3.80756 0.252276 3.70449 0.215488C3.60142 0.1787 3.49211 0.162574 3.38281 0.168029C3.16206 0.179047 2.95474 0.277305 2.80644 0.441186C1.42908 1.96516 0.666504 3.94618 0.666504 6.00035C0.666504 8.05452 1.42908 10.0355 2.80644 11.5595C2.95478 11.7232 3.16205 11.8213 3.38269 11.8323C3.60334 11.8432 3.8193 11.7661 3.9831 11.6179ZM8.99977 4.75035C8.75254 4.75035 8.51087 4.82366 8.30531 4.96102C8.09975 5.09837 7.93953 5.29359 7.84492 5.522C7.75031 5.75041 7.72556 6.00174 7.77379 6.24422C7.82202 6.48669 7.94107 6.70942 8.11589 6.88424C8.2907 7.05905 8.51343 7.1781 8.75591 7.22633C8.99838 7.27457 9.24972 7.24981 9.47812 7.1552C9.70653 7.06059 9.90176 6.90038 10.0391 6.69482C10.1765 6.48925 10.2498 6.24758 10.2498 6.00035C10.2498 5.66883 10.1181 5.35089 9.88365 5.11647C9.64923 4.88205 9.33129 4.75035 8.99977 4.75035Z" />
                    </svg>
                  </span>{" "}
                  Live Classes
                </Button>
              </Tooltip>
              <Tooltip placement="top" title="Deploy Experience">
                <Button
                  type="primary"
                  disabled={!selectedValue}
                  onClick={() => setDeployModal(true)}
                  loading={deployButtonLoading}
                  className="filter-button"
                >
                  <span className="icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.8443 15.2513H13.8C13.6875 14.8664 13.4533 14.5283 13.1325 14.2878C12.8117 14.0472 12.4215 13.9172 12.0205 13.9172C11.6196 13.9172 11.2294 14.0472 10.9086 14.2878C10.5877 14.5283 10.3535 14.8664 10.2411 15.2513H1.53333C1.39188 15.2513 1.25623 15.3075 1.15621 15.4076C1.05619 15.5076 1 15.6433 1 15.7847C1 15.9262 1.05619 16.0619 1.15621 16.1619C1.25623 16.2619 1.39188 16.3181 1.53333 16.3181H10.2427C10.3556 16.7024 10.5899 17.0398 10.9105 17.2798C11.2311 17.5198 11.6208 17.6495 12.0213 17.6495C12.4218 17.6495 12.8115 17.5198 13.1322 17.2798C13.4528 17.0398 13.6871 16.7024 13.8 16.3181H15.8427C15.9841 16.3181 16.1198 16.2619 16.2198 16.1619C16.3198 16.0619 16.376 15.9262 16.376 15.7847C16.376 15.6433 16.3198 15.5076 16.2198 15.4076C16.1198 15.3075 15.9841 15.2513 15.8427 15.2513H15.8443ZM12.0224 16.5848C11.8642 16.5848 11.7095 16.5379 11.5779 16.45C11.4464 16.3621 11.3438 16.2371 11.2833 16.0909C11.2227 15.9447 11.2069 15.7838 11.2378 15.6286C11.2686 15.4734 11.3448 15.3309 11.4567 15.219C11.5686 15.1071 11.7111 15.0309 11.8663 15C12.0215 14.9691 12.1824 14.985 12.3285 15.0455C12.4747 15.1061 12.5997 15.2086 12.6876 15.3402C12.7755 15.4718 12.8224 15.6265 12.8224 15.7847C12.8224 15.9969 12.7381 16.2004 12.5881 16.3505C12.4381 16.5005 12.2346 16.5848 12.0224 16.5848ZM15.3253 1H2.67467C2.23065 1.00042 1.80494 1.17702 1.49097 1.49103C1.177 1.80504 1.00042 2.23081 1 2.67489V11.06C1.00042 11.5041 1.177 11.9298 1.49097 12.2439C1.80494 12.5579 2.23065 12.7345 2.67467 12.7349H15.3253C15.7694 12.7345 16.1951 12.5579 16.509 12.2439C16.823 11.9298 16.9996 11.5041 17 11.06V2.67489C16.9996 2.23081 16.823 1.80504 16.509 1.49103C16.1951 1.17702 15.7694 1.00042 15.3253 1ZM15.9333 11.06C15.9332 11.2212 15.8691 11.3758 15.7551 11.4898C15.6411 11.6038 15.4865 11.6679 15.3253 11.6681H2.67467C2.51346 11.6679 2.35889 11.6038 2.2449 11.4898C2.13091 11.3758 2.06681 11.2212 2.06667 11.06V2.67489C2.06681 2.51366 2.13091 2.35907 2.2449 2.24507C2.35889 2.13106 2.51346 2.06695 2.67467 2.06681H15.3253C15.4865 2.06695 15.6411 2.13106 15.7551 2.24507C15.8691 2.35907 15.9332 2.51366 15.9333 2.67489V11.06Z"
                        // stroke="black"
                        strokeWidth="0.4"
                      />
                      <path
                        d="M11.7635 6.37151L7.76475 3.45485C7.68909 3.39966 7.60215 3.36911 7.51296 3.36638C7.42377 3.36365 7.33557 3.38882 7.25753 3.4393C7.17949 3.48978 7.11445 3.56372 7.06917 3.65344C7.02388 3.74315 7 3.84538 7 3.94951V9.78284C7 9.88697 7.02388 9.9892 7.06917 10.0789C7.11445 10.1686 7.17949 10.2426 7.25753 10.2931C7.33557 10.3435 7.42377 10.3687 7.51296 10.366C7.60215 10.3632 7.68909 10.3327 7.76475 10.2775L11.7635 7.36084C11.8358 7.30853 11.8955 7.23553 11.9369 7.14876C11.9783 7.06199 12 6.96432 12 6.86501C12 6.7657 11.9783 6.66803 11.9369 6.58126C11.8955 6.49449 11.8358 6.42149 11.7635 6.36918V6.37151ZM7.99968 8.73284V4.99951L10.5554 6.86618L7.99968 8.73284Z"
                        // stroke="black"
                        strokeWidth="0.4"
                      />
                    </svg>
                  </span>{" "}
                  Deploy
                </Button>
              </Tooltip>
              <ConfigProvider theme={ThemeConfig.light}>
              <Modal
                open={deployModal}
                footer={false}
                closable={true}
                width={"56%"}
                onCancel={() => setDeployModal(false)}
                 className="dark-mode-modal"
              >
                <div className="deployment-grade-wrp bg-[#fff]">
                  {deployStep == 1 ? (
                    <img src={modal1} alt="deploy-modal" />
                  ) : (
                    <img src={modal2} alt="deploy-modal" />
                  )}
                  <div className="content">
                    <Form
                      form={form}
                      onFinish={handleDeploy}
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 16 }}
                      style={{ maxWidth: 600 }}
                      autoComplete="off"
                      className="flex flex-col"
                    >
                      <p className="text-[24px] text-[#000] m-0 mb-3 text-center">
                        Select the Class for Deployment?
                      </p>
                      <p className="text-[32px] text-[#000] m-0 mb-4 text-center">
                        <span className=" text-[#00000080]">Choose</span>{" "}
                        {deployStep === 1 ? "Grade*" : "Section*"}
                      </p>
                      <div className="flex flex-col gap-4 min-h-[200px] max-h-[350px] ">
                        {deployStep === 1 && (
                          <div className="list-item-wrp">
                            {grades.map((grade) => (
                              <div key={grade.id} className="list-items">
                                {grade.name}{" "}
                                <button
                                  onClick={() => handleGradeChange(grade.id)}
                                >
                                  <HiArrowNarrowRight />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {deployStep === 2 && (
                          <>
                            {sections.length === 0 && (
                              <span className="flex justify-center py-6">
                                <Spin />
                              </span>
                            )}
                            <div className="list-item-wrp">
                              {sections.map((section) => (
                                <div key={section.id} className="list-items">
                                  {section.name}{" "}
                                  <button
                                    onClick={() =>
                                      handleSectionChange(section.id)
                                    }
                                  >
                                    <HiArrowNarrowRight />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      {/* <Form.Item wrapperCol={{ offset: 8, span: 16 }}> */}
                      {/* <Space> */}
                      {/* {deployStep === 1 && (
                                     <Button
                                       onClick={() => {
                                         setDeployModal(false);
                                         setDeployStep(1);
                                       }}
                                     >
                                       Cancel
                                     </Button>
                                   )} */}
                      <div className="flex items-center justify-center">
                        {deployStep === 2 && (
                          <button
                            className="back-button p-3 rounded-full border-none flex items-center justify-between gap-1"
                            onClick={() => {
                              setDeployStep(1);
                            }}
                          >
                            <HiChevronLeft /> <span>Back</span>
                          </button>
                        )}
                      </div>
                      {/* <Button type="primary" htmlType="submit">
                                         {deployStep === 1 ? "Next" : "Submit"}
                                       </Button> */}
                      {/* </Space> */}
                      {/* </Form.Item> */}
                    </Form>
                  </div>
                </div>
              </Modal>
              <Modal
                open={deployModalStep2}
                okButtonProps={{ disabled: !disabled }}
                onCancel={setDeployedDeactive}
                onOk={onSocketModel}
                width={"56%"}
                footer={false}
              >
                <div className="active-inactive-wrp">
                  <img src={modal2} alt="deploy-modal" />
                  <div className="active-inactive-content">
                    <p className="heading">Active & Inactive Devices</p>
                    <div className="flex flex-col gap-4 w-[90%]">
                      <div className="deploy_device_status_card active">
                        <img src={vrActive} alt="vr-active" />
                        <div className="status">
                          <p className="text-[#000]">Active</p>
                          <p className="text-[#00000080]">Devices</p>
                        </div>
                        <p>{onlineCount}</p>
                      </div>
                      <div className="deploy_device_status_card inactive">
                        <img src={vrInactive} alt="vr-inactive" />
                        <div className="status">
                          <p className="[#000]">Inactive</p>
                          <p className="[#00000080]">Devices</p>
                        </div>
                        <p>{offlineCount}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center mt-8 gap-4">
                      <button
                        className="back-button p-3 rounded-full border-none flex items-center justify-between gap-1"
                        onClick={() => {}}
                      >
                        <HiChevronLeft /> <span>Back</span>
                      </button>
                      <button
                        className="next-button px-5 py-3 bg-[#9A4BFF] text-[#fff] rounded-full border-none flex items-center justify-between gap-1"
                        onClick={() => {
                          handleClose();
                        }}
                      >
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Modal>
              <Modal
                open={deployModalStep3}
                onCancel={() => setDeployModalStep3(false)}
                okButtonProps={{ disabled: !disabled }}
                width={"56%"}
                footer={false}
              >
                <div className="flex flex-col gap-4 p-6">
                  <p className="text-[24px] text-[#000] m-0 mb-3 text-center w-[100%] max-w-[80%] mx-auto text-wrap">
                    Connected Device - {SessionName}
                  </p>
                  <p className="text-[34px] font-bold text-[#000] m-0 mb-3 text-center w-[100%] max-w-[80%] mx-auto text-wrap">
                    Total Count
                  </p>
                  <div className="grid grid-cols-3 gap-4 mx-3">
                    <div className="flex items-center gap-4 bg-[#F8E4F2] px-4 py-4 rounded-[20px]">
                      <div className="w-[56px] h-[56px] flex items-center justify-center bg-[#fff] rounded-full">
                        <img
                          className="w-[35px]"
                          src={vrgActive}
                          alt="vr-active"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[#000] text-[24px] font-bold m-0 p-0">
                          {onlineDevices.length}
                        </p>
                        <p className="text-[#000] text-[16px] m-0 p-0">
                          Active
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-[#E4F8F0] px-4 py-4 rounded-[20px]">
                      <div className="w-[56px] h-[56px] flex items-center justify-center bg-[#fff] rounded-full">
                        <img
                          className="w-[35px]"
                          src={vrgInactive}
                          alt="vr-inactive"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[#000] text-[24px] font-bold m-0 p-0">
                          {offlineDevices.length}
                        </p>
                        <p className="text-[#000] text-[16px] m-0 p-0">
                          Inactive
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-[#EDDEFF] px-4 py-4 rounded-[20px]">
                      <div className="w-[56px] h-[56px] flex items-center justify-center bg-[#fff] rounded-full">
                        <img
                          className="w-[35px]"
                          src={vrgCompleted}
                          alt="vr-completed"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[#000] text-[24px] font-bold m-0 p-0">
                          {completedSyncedDevices.length}
                        </p>
                        <p className="text-[#000] text-[16px] m-0 p-0">
                          Completed Students
                        </p>
                      </div>
                    </div>
                  </div>
                  {!afterStart ? (
                    <>
                      <div className="flex items-center justify-center mt-3 gap-4">
                        {/* <div className="flex gap-4"> */}
                        {/* <Space> */}

                        <Tooltip placement="top" title="Start Class">
                          <Popconfirm
                            title="Start the Class"
                            description="Are you sure to Start this class?"
                            onConfirm={handleStart}
                            okText="Yes"
                            cancelText="No"
                          >
                            <button
                              disabled={!start}
                              className={`flex items-center gap-2 px-6 py-4 rounded-full  text-[16px]  border-none ${
                                !start
                                  ? "bg-[#ffffff1c] text-[#969696] cursor-not-allowed"
                                  : "bg-[#000] text-[#fff]"
                              }`}
                            >
                              Start{" "}
                              <span className="text-[20px] flex flex-col justify-center items-center">
                                <MdChevronRight />
                              </span>
                            </button>
                          </Popconfirm>
                        </Tooltip>

                        <Tooltip placement="top" title="Stop Class">
                          <Popconfirm
                            title="Stop the Class"
                            description="Are you sure to Stop this class?"
                            onConfirm={handleCurrentStop}
                            okText="Yes"
                            cancelText="No"
                          >
                            <button className="flex items-center gap-2 px-6 py-4 rounded-full  text-[16px]  border-none bg-[#FF4A51] text-[#fff]">
                              <span className="text-[20px] flex flex-col justify-center items-center">
                                <FaRegCircleStop />
                              </span>
                              Stop
                            </button>
                          </Popconfirm>
                        </Tooltip>
                        {/* </Space> */}
                        {/* </div> */}
                      </div>
                      <Row gutter={[16, 16]}>
                        {onlineDevices}
                        {offlineDevices}
                      </Row>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <Tooltip placement="top" title="Stop Class">
                        <Popconfirm
                          title="Stop the Class"
                          description="Are you sure to Stop this class?"
                          onConfirm={handleCurrentStopValue}
                          okText="Yes"
                          cancelText="No"
                        >
                          <button className="flex items-center gap-2 px-6 py-4 rounded-full  text-[16px]  border-none bg-[#FF4A51] text-[#fff]">
                            <span className="text-[20px] flex flex-col justify-center items-center">
                              <FaRegCircleStop />
                            </span>
                            Experience Stop
                          </button>
                        </Popconfirm>
                      </Tooltip>
                      <Tooltip placement="top" title="Finish Class">
                        <Popconfirm
                          title="Finish the Class"
                          description="Are you sure to Finish this class?"
                          onConfirm={handleStop}
                          okText="Yes"
                          cancelText="No"
                        >
                          <button
                            disabled={userCompleteStop}
                            className={`flex items-center gap-2 px-6 py-4 rounded-full  text-[16px]  border-none ${
                              userCompleteStop
                                ? "bg-[#ffffff1c] text-[#969696] cursor-not-allowed"
                                : "bg-[#000] text-[#fff]"
                            }`}
                          >
                            Finish{" "}
                          </button>
                        </Popconfirm>
                      </Tooltip>
                    </div>
                    // <Row gutter={[16, 16]}>{onlineDevices}</Row>
                  )}
                </div>
              </Modal>
              </ConfigProvider>
              {/* <Tooltip placement="top" title="Add Experience">
                <Button
                  type="primary"
                  onClick={onRoute}
                  icon={<PlusOutlined />}
                  className="rounded-full"
                ></Button>
              </Tooltip> */}
            </div>
          </div>
        }
      >
        <ExperienceTable
          data={filteredExperience}
          handleRefresh={handleRefresh}
          loading={loading}
          handleDeploy={handleDeploy}
          handleView={handleView}
          setSelectedValue={setSelectedValue}
          selectedValue={selectedValue}
          setHeader={setHeader}
        />
      </ContentWrapper>
    </>
  );
};
export default Experience;
