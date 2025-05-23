import CardDataStatsTypeTwo from "../../../components/CardDataStatsTypeTwo";
import ChartOne from "../../../components/Charts/ChartOne";
import ChartTwo from "../../../components/Charts/ChartTwo";
import { useEffect, useState } from "react";
import { SystemAdmin } from "../../../services/Index";
import { Spin } from "antd";
import ContentWrapper from "../../../components/ContentWrapper";
import DmyExperience from "../../../assets/dashboard/dme.png";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await SystemAdmin();
        const formattedData = {
          ...res,
          clientSchoolPerfomance: {
            data: res.clientSchoolPerfomance.map((value) => parseFloat(value.averageScore).toFixed(2)),
            labels: res.clientSchoolPerfomance.map((value) => value.schoolName),
          },
        };
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: "School count",
      total: data?.totalNoOfSchools,
      icon: <img className="w-[26px]" src={DmyExperience} alt="" />,
    },
    {
      title: "3D Model Count",
      total: data?.totalNoOf3dModels,
      icon: <img className="w-[26px]" src={DmyExperience} alt="" />,
    },
    {
      title: "360 Image Count",
      total: data?.totalNoOfImage360,
      icon: <img className="w-[26px]" src={DmyExperience} alt="" />,
    },
    {
      title: "Simulation Count",
      total: data?.totalNoOfSimulation,
      icon: <img className="w-[26px]" src={DmyExperience} alt="" />,
    },
    {
      title: "Total 360 Videos",
      total: data?.totalNoOf360Videos,
      icon: <img className="w-[26px]" src={DmyExperience} alt="" />,
    },
    {
      title: "Total Experience Created",
      total: data?.totalNoOfExperienceCreated,
      icon: <img className="w-[26px]" src={DmyExperience} alt="" />,
    },
    {
      title: "Total VR Devices",
      total: data?.totalNoOfVrDevice,
      icon: <img className="w-[26px]" src={DmyExperience} alt="" />,
    },
  ];

  return (
    <ContentWrapper header="Dashboard">
      {loading && (
        <div className="flex justify-center items-center h-full">
          <Spin spinning={loading} size="large" />
        </div>
      )}
      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 flex">
            {statsCards.map((card, index) => (
              <CardDataStatsTypeTwo
                key={index}
                title={card.title}
                total={card.total}
                rate=""
                levelUp={false}
                className="flex space-evenly"
              >
                {card.icon}
              </CardDataStatsTypeTwo>
            ))}
          </div>

          <div className="mt-4 grid" style={{ gridTemplateColumns: "60% 40%" }}>
            <ChartOne data={data.clientSchoolPerfomance} />
            <ChartTwo data={data.totalNoOfUsersWithRole} />
          </div>
        </>
      )}
    </ContentWrapper>
  );
};

export default Dashboard;
