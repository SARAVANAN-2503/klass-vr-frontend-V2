import React, { useEffect, useRef, useState } from "react";
import { Col, Row, Typography, Spin, Card, Input, Form, Space, Radio, Image, Button, Modal, Collapse, ConfigProvider } from "antd";
import { GetSimulation } from "../../../services/Index";
import { LoadingOutlined } from "@ant-design/icons";
import "./style.css";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import SimulationIFrame from "../../../common/SimulationIFrame";
import searchIcon from "../../../assets/icons/search.svg";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/config/redux";
import { MdDeleteOutline } from "react-icons/md";
import ThemeConfig from "../../../utils/ThemeConfig";

dayjs.extend(customParseFormat);

const Simulation = ({ _edit, content, setContent, handleBack, handleClose, handleSave, addLoader, setActiveKey }) => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [value4, setValue4] = useState("");
  const [searchValue, setSearchValue] = useState({ title: "", tags: "" });
  const [form] = Form.useForm();
  const [simulationPreviewUrl, setSimulationPreviewUrl] = useState(
    content.simulationDetails?.[0]?.simulationDetail?.simulationURL || null,
  );
  const [showCollapse, setShowCollapse] = useState(content.simulationDetails?.length > 0);
  const [openModel, setOpenModel] = useState(false);
  const [loadingSimulations, setLoadingSimulations] = useState(true);
  const [simulationList, setSimulationList] = useState([]);
  const [contentValue, setContentValue] = useState({
    simulationId: content.simulationDetails?.[0]?.simulationId || "",
    displayTime: content.simulationDetails?.[0]?.displayTime || "10:00",
  });

  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction * 400,
        behavior: "smooth",
      });
    }
  };

  const handleDelete = () => {
    setContent((prev) => ({
      ...prev,
      simulationDetails: [],
    }));
    setValue4("");
    setContentValue({
      simulationId: "",
      displayTime: "10:00",
    });
    setShowCollapse(false);
    setSimulationPreviewUrl(null);
  };

  const handleSimulationSelect = (selectedSimulation) => {
    const newContentValue = {
      ...contentValue,
      simulationId: selectedSimulation.id,
    };

    setSimulationPreviewUrl(selectedSimulation.simulationURL);
    setContentValue(newContentValue);
    setContent((prev) => ({
      ...prev,
      simulationDetails: [newContentValue],
    }));
    setShowCollapse(true);
    setOpenModel(false);
  };

  const handleChangeTime = (time, name) => {
    const formattedTime = time.format("mm:ss");
    const newContentValue = { ...contentValue, [name]: formattedTime };

    setContentValue(newContentValue);
    setContent((prev) => ({
      ...prev,
      simulationDetails: [newContentValue],
    }));
  };

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const filteredSearch = Object.fromEntries(Object.entries(searchValue).filter(([_, value]) => value !== ""));
        const res = await GetSimulation(Object.keys(filteredSearch).length > 0 ? filteredSearch : undefined);
        setSimulationList(res.results);
      } catch (error) {
        console.error("Error fetching simulations:", error);
      } finally {
        setLoadingSimulations(false);
      }
    };

    fetchSimulations();
  }, [searchValue]);

  const items = [
    {
      key: "1",
      label: "360 Simulation",
      children: (
        <Form
          name="basic"
          initialValues={{
            displayTime: content.simulationDetails?.[0]?.displayTime || "",
          }}
          onFinish={handleSave}
          autoComplete="off"
          layout="vertical"
        >
          {simulationPreviewUrl && (
            <Col span={24}>
              <SimulationIFrame url={simulationPreviewUrl} />
            </Col>
          )}

          <Row gutter={16} className="mt-5">
            <Col span={12}>
              <Form.Item
                label="Simulation Time"
                name="displayTime"
                rules={[{ required: true, message: "Please enter display time!" }]}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs} className="w-full">
                  <TimePicker
                    className="w-full"
                    value={dayjs(contentValue.displayTime, "mm:ss")}
                    onChange={(time) => handleChangeTime(time, "displayTime")}
                    views={["minutes", "seconds"]}
                    format="mm:ss"
                  />
                </LocalizationProvider>
              </Form.Item>
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

          <Col span={24}>
            <div className="mt-5 flex justify-end">
              {_edit ? (
                <div className="fixed top-[-38px] right-[10px]">
                  <Form.Item className="m-0">
                    <Button type="primary" htmlType="submit" loading={addLoader} className="form-button">
                      {_edit ? "Save" : "Continue"}
                    </Button>
                  </Form.Item>
                </div>
              ) : (
                <>
                  <Button type="default" className="mr-5" onClick={handleClose}>
                    Close
                  </Button>
                  <Button type="primary" className="mr-5" onClick={() => handleBack("5")}>
                    Back
                  </Button>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={addLoader}>
                      Save & Next
                    </Button>
                  </Form.Item>
                </>
              )}
            </div>
          </Col>
        </Form>
      ),
    },
  ];

  return (
    <Spin spinning={addLoader}>
      {showCollapse ? (
        <Collapse defaultActiveKey={["1"]} accordion items={items} />
      ) : (
        <>
          <div className="inner-glass-card">
            <p className="header-text font-[700] text-[24px]">Simulation</p>
            <Radio.Group
              options={[{ label: "Repo Simulation", value: "repo" }]}
              onChange={(e) => {
                setValue4(e.target.value);
                if (e.target.value === "repo") setOpenModel(true);
              }}
              value={value4}
              optionType="button"
              buttonStyle="solid"
              className="simulation_buttons"
            />
          </div>
          {!_edit && (
            <Col span={24}>
              <div className="flex justify-start gap-4 mt-5 pl-4">
                <Button type="primary" onClick={() => handleBack("5")} size="large" className="rounded-full bg-black">
                  Previous
                </Button>
                <Button
                  type="primary"
                  loading={addLoader}
                  onClick={() => setActiveKey("7")}
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
          className="custom-close-button"
          open={openModel}
          onCancel={() => {
            setOpenModel(false);
            setValue4("");
          }}
          footer={null}
          width={1012}
        >
          <div className="py-5 px-3">
            <div className="flex flex-col items-center justify-between p-4">
              <Typography className="text-xl pt-5 m-0">Select Simulation</Typography>
              <div className="flex items-center justify-between mt-7">
                <Input
                  placeholder="Search the simulation, tags"
                  className="w-[420px] p-3 border-none rounded-xl"
                  value={searchValue.title}
                  name="title"
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchValue((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            {loadingSimulations ? (
              <div style={{ textAlign: "center" }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex gap-4 overflow-hidden my-4">
                  {simulationList.map((val, index) => (
                    <Card
                      key={index}
                      hoverable
                      onClick={() => handleSimulationSelect(val)}
                      className="h-[275px] w-[800px] flex flex-col border-gray-300 ml-4"
                    >
                      <img
                        width={352}
                        height={189}
                        className="rounded-md"
                        alt="thumbnailUrl"
                        src={val.thumbnailURL}
                        // style={{ display: "block", width: "100%" }}
                      />
                      <Typography className="mt-5">{val.title}</Typography>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => handleScroll(-1)}
                    className="border-none bg-[#F8F2FF] text-[#9A4BFF] w-2 rounded-full text-md"
                  >
                    {"<"}
                  </Button>
                  <Button
                    onClick={() => handleScroll(1)}
                    className="border-none bg-[#F8F2FF] text-[#9A4BFF] w-2 rounded-full text-md"
                  >
                    {">"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </ConfigProvider>
    </Spin>
  );
};

export default Simulation;
