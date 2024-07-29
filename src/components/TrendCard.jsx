import React, { useEffect, useRef, memo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const generateChartData = (labels, data, title) => ({
  labels: labels,
  datasets: [
    {
      label: title,
      data: data,
      fill: false,
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      tension: 0.1
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "category"
    },
    y: {
      beginAtZero: true
    }
  }
};

const TrendCard = ({ title, icon: Icon, labels, data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-gridItemBg p-5 text-center rounded-lg flex flex-col justify-between h-full">
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 w-16" style={{ flex: "0 0 4rem" }}></div>
        <div className="flex-grow text-xl flex justify-center text-gridItemHeader" style={{ flex: "1 1 auto" }}>
          {title}
        </div>
        <div className="flex-shrink-0 w-16 flex items-end justify-end" style={{ flex: "0 0 4rem" }}>
          <Icon className="text-4xl text-svg" />
        </div>
      </div>
      <hr className="border-hrColor" />
      <div className="h-48">
        <Line ref={chartRef} data={generateChartData(labels, data, title)} options={chartOptions} />
      </div>
    </div>
  );
};

const MemoizedTrendCard = memo(TrendCard);
export default MemoizedTrendCard;
