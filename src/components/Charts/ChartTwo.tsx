// ChartTwo component
import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const ChartTwo = ({ data }) => {
  const options: ApexOptions = {
    xaxis: {
      categories: ["Teachers", "Admins", "SuperAdmins", "RepoTeam"],
    },
    colors: ["#9a4bff"],
  };

  const seriesData = [
    {
      name: "Total",
      data: [data.totalNoOfTeacher, data.totalNoOfAdmin, data.totalNoOfSuperAdmin, data.totalNoOfRepoTeam],
    },
  ];

  return (
      <div id="chartTwo">
      <ReactApexChart options={options} series={seriesData} type="area" height={400} />
    </div>
  );
};

export default ChartTwo;
