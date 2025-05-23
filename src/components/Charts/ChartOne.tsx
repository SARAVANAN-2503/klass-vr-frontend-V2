// ChartOne component
import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const ChartOne = ({ data }) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
    },
    xaxis: {
      categories: data.labels,
      title: {
        text: "School",
      },
    },
    yaxis: {
      title: {
        text: "Performance",
      },
    },
    colors: ["#9a4bff"],
  };

  return (
    <div id="chartOne">
      <ReactApexChart options={options} series={[{ name: "Performance", data: data.data }]} type="bar" height={400} />
    </div>
  );
};

export default ChartOne;
