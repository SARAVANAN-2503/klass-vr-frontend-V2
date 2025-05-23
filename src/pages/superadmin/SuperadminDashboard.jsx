import { useEffect, useState } from "react";
import { Superadmin, SuperadminWithoutParams, TeachersFilter } from "../../services/Index";
import { Card, Col, Divider, Row, Select, Spin } from "antd";
import ReactApexChart from "react-apexcharts";
import CardDataStats from "../../components/CardDataStats";
import { CrownFilled, DatabaseFilled, HomeOutlined } from "@ant-design/icons";
import ContentWrapper from "../../components/ContentWrapper";
import { useAppSelector } from "../../store/config/redux";
import moment from "moment";

import SDETC from "../../assets/dashboard/SDETC.png";
import SDTE from "../../assets/dashboard/SDTE.png";
import SDTA from "../../assets/dashboard/SDTA.png";

const { Option } = Select;

const SuperadminDashboard = () => {
  const [data, setData] = useState(null);
  const [data1, setData1] = useState(null);
  const [teacherData, setTeacherData] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState({ id: "" });
  const [loading, setLoading] = useState(true);
  const selectedTheme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [teachers, adminData] = await Promise.all([TeachersFilter(), SuperadminWithoutParams()]);
        setTeacherData(teachers);
        setData1(adminData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchData = async (teacherId) => {
    if (!teacherId) {
      setData(null);
      return;
    }

    setLoading(true);
    try {
      const res = await Superadmin({ teacherId });
      setData(res);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setTeacherFilter((prev) => ({ ...prev, [name]: value }));
    fetchData(value);
  };

  const renderStatsCards = (statsData) => (
    // <div className="grid grid-cols-8 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
    //   <CardDataStats
    //     title="Total Experience Conducted"
    //     total={statsData?.totalNoOfExperienceConducted ?? 0}
    //     rate="0.43%"
    //   >
    //     <HomeOutlined style={{ fontSize: "50px", color: "#ba28a9" }} />
    //   </CardDataStats>
    //   <CardDataStats title="Total Experience" total={statsData?.totalNoOfExperience ?? 0} rate="4.35%">
    //     <CrownFilled style={{ fontSize: "50px", color: "#ba28a9" }} />
    //   </CardDataStats>
    //   <CardDataStats title="Total Assessment" total={statsData?.totalNoOfAssessment ?? 0} rate="2.59%">
    //     <DatabaseFilled style={{ fontSize: "50px", color: "#ba28a9" }} />
    //   </CardDataStats>
    // </div>
    <div className="grid grid-cols-3 gap-4 mt-4">
      <div className="bg-[#fff] rounded-[24px] px-4 py-5 flex justify-between items-center">
        <div className="">
          <p className="text-[#9A4BFF] m-0 text-[40px] font-extrabold">
            {statsData?.totalNoOfExperienceConducted ?? 0}
          </p>
          <p className="text-[#000000] m-0 text-[16px] font-bold">
            Experience <br />
            Total Conducted
          </p>
        </div>
        <div className="w-[72px] h-[72px] flex justify-center items-center rounded-full bg-[#F0E4FF]">
          <img className="w-[26px]" src={SDETC} alt="" />
        </div>
      </div>

      <div className="bg-[#fff] rounded-[24px] px-4 py-5 flex justify-between items-center">
        <div className="">
          <p className="text-[#FF489B] m-0 text-[40px] font-extrabold">{statsData?.totalNoOfExperience ?? 0}</p>
          <p className="text-[#000000] m-0 text-[16px] font-bold">
            Total <br />
            Experience
          </p>
        </div>
        <div className="w-[72px] h-[72px] flex justify-center items-center rounded-full bg-[#FFE4F0]">
          <img className="w-[26px]" src={SDTE} alt="" />
        </div>
      </div>

      <div className="bg-[#fff] rounded-[24px] px-4 py-5 flex justify-between items-center">
        <div className="">
          <p className="text-[#FF8A00] m-0 text-[40px] font-extrabold">{statsData?.totalNoOfAssessment ?? 0}</p>
          <p className="text-[#000000] m-0 text-[16px] font-bold">
            Total <br />
            Assessment
          </p>
        </div>
        <div className="w-[72px] h-[72px] flex justify-center items-center rounded-full bg-[#FFF3E5]">
          <img className="w-[26px]" src={SDTA} alt="" />
        </div>
      </div>
    </div>
  );
  const generatePast30Days = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      dates.push(moment().subtract(i, "days").format("YYYY-MM-DD"));
    }
    return dates.reverse();
  };
  const past30Days = generatePast30Days();

  const chartSeries = data
    ? [
        {
          name: "Total Experience Created",
          data: past30Days.map((date) => {
            const item = data.totalNoOfExperienceByTeacher.find((item) => item._id === date);
            return item && item.count > 0 ? item.count : null;
          }),
        },
        {
          name: "Experience Deployed",
          data: past30Days.map((date) => {
            const item = data.ExperienceDeployedByTeacher.find((item) => item._id === date);
            return item && item.count > 0 ? item.count : null;
          }),
        },
        {
          name: "Assessment Created",
          data: past30Days.map((date) => {
            const item = data.AssessmentCreatedByTeacher.find((item) => item._id === date);
            return item && item.count > 0 ? item.count : null;
          }),
        },
      ]
    : [];

  const chartOptions = {
    series: chartSeries,
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "15px",
          borderRadius: 5,
          borderRadiusApplication: "end",
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
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: past30Days,
      },
      yaxis: {
        title: {
          text: "Count",
        },
      },
      fill: {
        opacity: 1,
      },
    },
  };

  return (
    <ContentWrapper header="Dashboard">
      <Row>
        <Col className="flex pb-3">
          <Select
            placeholder="Please select a teacher"
            allowClear
            onChange={(value) => handleInputChange("id", value)}
            onClear={() => handleInputChange("id", "")}
            style={{ width: "200px" }}
          >
            {teacherData.map((sub) => (
              <Option key={sub.id} value={sub.id}>
                <span
                  style={{
                    color: selectedTheme === "dark" ? "white" : "black",
                  }}
                >
                  {sub.name}
                </span>
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {renderStatsCards(data || data1)}

        {data && (
          // < className="mt-6 rounded-sm border border-stroke  px-5 pt-7.5 pb-5 shadow-default sm:px-7.5 xl:col-span-8">
          <div className="mt-6 rounded-sm border border-stroke  px-5 pt-7.5 pb-5 shadow-default sm:px-7.5 xl:col-span-8">
            <p className="text-[24px] font-bold">Teacherwise Data</p>
            <div id="combinedChart" style={{ marginTop: "20px" }}>
              <ReactApexChart options={chartOptions.options} series={chartOptions.series} type="bar" height={350} />
            </div>
          </div>
        )}
      </Spin>
    </ContentWrapper>
  );
};

export default SuperadminDashboard;
