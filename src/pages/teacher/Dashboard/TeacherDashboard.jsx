import { useEffect, useRef, useState } from "react";
import { Column } from "@ant-design/plots";
import {
  GradeSectionPerfomance,
  TeacherDashboards,
  GradeSectionFilter,
  GradePerformance,
} from "../../../services/Index";
import { Card, Select, message, Button, Popover, ConfigProvider, Spin } from "antd";
import ContentWrapper from "../../../components/ContentWrapper";
import { DownloadOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas"; // Ensure this is installed
import DmyExperience from "../../../assets/dashboard/dme.png";
import DExperience from "../../../assets/dashboard/de.png";
import DActiveDevices from "../../../assets/dashboard/dae.png";
import { useAppSelector } from "../../../store/config/redux";
import ReactApexChart from "react-apexcharts";
import "./TeacherDashboard.css";
import svgIcon from "../../../assets/dashboard/svg_icon.png";
import pngIcon from "../../../assets/dashboard/png_icon.png";
import csvIcon from "../../../assets/dashboard/csv_icon.png";
import ThemeConfig from "../../../utils/ThemeConfig";
import * as XLSX from "xlsx";

const { Option } = Select;
const TeacherDashboard = () => {
  const selectedTheme = useAppSelector((state) => state.theme.theme);
  const [data, setData] = useState([]);
  const [value, setValue] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [formData, setFormData] = useState({ gradeId: null, sectionId: null });
  const [showDefaultChart, setShowDefaultChart] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setChartLoading(true);
      try {
        const res = await GradeSectionPerfomance();
        const value = await GradePerformance();
        setData(res);
        setValue(value);
        setChartLoading(false);
      } catch (error) {
        message.error("Failed to fetch performance data");
        console.error("Error fetching data:", error);
        setChartLoading(false);
      }
    };

    fetchPerformanceData();
  }, [showDefaultChart]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (formData.gradeId && formData.sectionId) {
        try {
          const res = await TeacherDashboards(formData);
          setShowDefaultChart(false);
          setFilteredData(res.clientSchoolPerfomance || []);
        } catch (error) {
          message.error("Failed to fetch filtered data");
          console.error("Error fetching filtered data:", error);
        }
      } else {
        setFilteredData([]);
        setShowDefaultChart(true);
      }
    };
    fetchFilteredData();
  }, [formData]);

  const handleGradeChange = async (gradeId) => {
    setFormData({ gradeId, sectionId: null });
    if (!gradeId) {
      setSections([]);
      return;
    }

    try {
      const response = await GradeSectionFilter(gradeId);
      setSections(response);
    } catch (error) {
      message.error("Error fetching sections");
      console.error("Error:", error);
    }
  };
  const imageRef = useRef(null);

  const downloadChartAsImage = async (type) => {
    if (imageRef.current) {
      html2canvas(imageRef.current)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = imgData;
          downloadLink.download = "chart.png";
          downloadLink.click();
          URL.revokeObjectURL(downloadLink.href);
          message.success("Chart downloaded as PNG");
        })
        .catch((error) => {
          console.error("Download error:", error);
          message.error("Failed to download chart");
        });
    }
  };

  const renderFilterChart = (chartData) => {
    if (!filteredData || filteredData.length === 0) {
      return <div>No data available for the chart</div>;
    }

    const options = {
      chart: {
        type: "bar",
      },
      xaxis: {
        categories: filteredData.map((item) => item.studentID),
        title: {
          text: "Student ID",
          style: {
            color: selectedTheme === "dark" ? "#ffffff" : "#000000",
          },
        },
        labels: {
          style: {
            colors: selectedTheme === "dark" ? "#ffffff" : "#000000",
          },
        },
      },
      yaxis: {
        title: {
          text: "Average Score",
          style: {
            color: selectedTheme === "dark" ? "#ffffff" : "#000000",
          },
        },
        labels: {
          style: {
            colors: selectedTheme === "dark" ? "#ffffff" : "#000000",
          },
        },
      },
      colors: ["#9a4bff"],
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#FFFFFF"],
          opacity: 0.6,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        markers: {
          shape: "circle",
        },
      },
    };

    const series = [
      {
        name: "Average Score",
        data: filteredData.map((item) => item.averageScore),
      },
    ];

    return <ReactApexChart options={options} series={series} type="bar" height={450} />;
  };

  const renderDefaultChart = (chartData) => {
    if (!chartData || chartData.length === 0) {
      return (
        <>
          {chartLoading ? (
            <div className="h-[30vh] w-full flex justify-center items-center">
              <Spin spinning={chartLoading} />
            </div>
          ) : (
            <div>No Data Available</div>
          )}
        </>
      );
    }

    const seriesData = chartData.map((item) => ({
      name: item.name,
      data: [item.score, item.students],
    }));

    const options = {
      chart: {
        type: "bar",
        height: 450,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
          dataLabels: {
            position: "bottom",
          },
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["Score", "Students"],
        title: {
          text: "Sections",
        },
        labels: {
          style: {
            colors: selectedTheme === "dark" ? "#ffffff" : "#000000",
          },
        },
      },
      yaxis: {
        title: {
          text: "Values",
        },
        labels: {
          style: {
            colors: selectedTheme === "dark" ? "#ffffff" : "#000000",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      colors: ["#6f82ff", "#ff5f82"],
      legend: {
        position: "top",
        horizontalAlign: "left",
        markers: {
          shape: "circle",
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: "middle",
        distributed: false,
        offsetX: 0,
        offsetY: 2,
        style: {
          fontSize: "14px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: "bold",
          colors: selectedTheme === "dark" ? ["#ffffff47"] : ["#4b4b4b47"],
        },
        background: {
          enabled: true,
          padding: 10,
          borderRadius: 10,
          borderWidth: 0,
          borderColor: "#fff",
          opacity: 0.9,
        },
      },
    };

    return <ReactApexChart options={options} series={seriesData} type="bar" height={450} />;
  };

  const chartAsSvg = () => {
    const svgElement = document.querySelector("#chartDocument");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "chart.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const chartAsExcel = (chartData) => {
    const seriesData = chartData.map((item) => ({
      Name: item.name,
      Score: item.score,
      Student: item.students,
    }));

    const worksheet = XLSX.utils.json_to_sheet(seriesData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chart Data");

    XLSX.writeFile(workbook, "chart_data.xlsx");
  };

  return (
    <ContentWrapper
      header="Dashboard"
      extra={
        <div className="flex items-center gap-4">
          <Select
            className="min-w-48 filter-select"
            placeholder="Find by Grade"
            allowClear
            onChange={handleGradeChange}
          >
            {data.map((grade) => (
              <Option
                key={grade.gradeID}
                value={grade.gradeID}
                style={{
                  color: selectedTheme === "dark" ? "white" : "black",
                }}
              >
                <span
                  style={{
                    color: selectedTheme === "dark" ? "white" : "black",
                  }}
                >
                  {grade.gradeName}
                </span>
              </Option>
            ))}
          </Select>
          <Select
            className="min-w-48 filter-select"
            placeholder="Find by Section"
            value={formData.sectionId}
            onChange={(value) => setFormData({ ...formData, sectionId: value })}
            disabled={!sections.length}
            style={{
              color: selectedTheme === "dark" ? "white" : "black",
            }}
          >
            {sections.map((section) => (
              <Option key={section.id} value={section.id}>
                <span
                  style={{
                    color: selectedTheme === "dark" ? "white" : "black",
                  }}
                >
                  {section.name}
                </span>
              </Option>
            ))}
          </Select>
          <ConfigProvider theme={ThemeConfig.light}>
            <Popover
              className="DashboardPopover rounded-full"
              placement="bottomRight"
              content={
                <div className="flex gap-4">
                  <Button
                    disabled={data.length === 0}
                    className="bg-[#F4ECFF] text-[#39195D] uppercase font-bold"
                    type="primary"
                    onClick={() => chartAsSvg("png")}
                  >
                    <img src={svgIcon} width="18px" />
                    <span>SVG</span>
                  </Button>
                  <Button
                    disabled={data.length === 0}
                    className="bg-[#FFF2E1] text-[#39195D] uppercase font-bold"
                    type="primary"
                    onClick={() => downloadChartAsImage("png")}
                  >
                    <img src={pngIcon} width="13px" />
                    <span>PNG</span>
                  </Button>
                  <Button
                    disabled={data.length === 0}
                    className="bg-[#DCFEED] text-[#39195D] uppercase font-bold"
                    type="primary"
                    onClick={() => chartAsExcel(data)}
                  >
                    <img src={csvIcon} width="14px" />
                    <span>CSV</span>
                  </Button>
                </div>
              }
              trigger="click"
            >
              <Button type="primary" icon={<DownloadOutlined />} />
            </Popover>
          </ConfigProvider>
        </div>
      }
    >
      <h1 className="m-0 px-4">Grade</h1>
      <div className="rounded-[24px] px-4 py-5" ref={imageRef} id="chartDocument">
        {showDefaultChart && renderDefaultChart(data)}
        {!showDefaultChart && renderFilterChart()}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-[#fff] rounded-[24px] px-4 py-5 flex justify-between items-center">
          <div className="">
            <p className="text-[#9A4BFF] m-0 text-[40px] font-extrabold">{value.myExperienceCount}</p>
            <p className="text-[#000000] m-0 text-[16px] font-bold">My Experience</p>
          </div>
          <div className="w-[72px] h-[72px] flex justify-center items-center rounded-full bg-[#F0E4FF]">
            <img className="w-[26px]" src={DmyExperience} alt="" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[24px] px-4 py-5 flex justify-between items-center">
          <div className="">
            <p className="text-[#FF489B] m-0 text-[40px] font-extrabold">{value.totalNoOfExperienceCount}</p>
            <p className="text-[#000000] m-0 text-[16px] font-bold">Experience</p>
          </div>
          <div className="w-[72px] h-[72px] flex justify-center items-center rounded-full bg-[#FFE4F0]">
            <img className="w-[26px]" src={DExperience} alt="" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[24px] px-4 py-5 flex justify-between items-center">
          <div className="">
            <p className="text-[#FF8A00] m-0 text-[40px] font-extrabold">{value.activeDeviceCount}</p>
            <p className="text-[#000000] m-0 text-[16px] font-bold">Active Devices</p>
          </div>
          <div className="w-[72px] h-[72px] flex justify-center items-center rounded-full bg-[#FFF3E5]">
            <img className="w-[26px]" src={DActiveDevices} alt="" />
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
};

export default TeacherDashboard;
