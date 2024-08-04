import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import log from "../utils/logger";
import { getCssVariable } from "../utils/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Function to generate chart data
const generateChartData = (labels, data, title) => ({
  labels: labels,
  datasets: [
    {
      label: title,
      data: data,
      fill: false,
      backgroundColor: getCssVariable("--chart-bg-color", "rgba(75, 192, 192, 0.2)"),
      borderColor: getCssVariable("--chart-line-color", "rgba(75, 192, 192, 1)"),
      pointBackgroundColor: getCssVariable("--chart-point-bg-color", "rgba(75, 192, 192, 1)"),
      pointBorderColor: getCssVariable("--chart-point-border-color", "rgba(75, 192, 192, 1)"),
      pointHoverBackgroundColor: getCssVariable("--chart-point-hover-bg-color", "rgba(255, 99, 132, 1)"),
      pointHoverBorderColor: getCssVariable("--chart-point-hover-border-color", "rgba(255, 99, 132, 1)"),
      tension: 0.1,
      hoverBackgroundColor: getCssVariable("--chart-hover-bg-color", "rgba(75, 192, 192, 0.2)"),
      hoverBorderColor: getCssVariable("--chart-hover-border-color", "rgba(75, 192, 192, 1)")
    }
  ]
});

// Chart options
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

// TrendCard component
const TrendCard = ({ title, icon: Icon, labels, data }) => {
  const chartRef = useRef(null);

  // Effect to clean up chart instance on unmount
  useEffect(() => {
    log.info({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, `Rendering TrendCard for ${title}`);

    const currentChartRef = chartRef.current; // Copy ref to a variable

    return () => {
      if (currentChartRef && currentChartRef.chartInstance) {
        log.info({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, `Destroying chart instance for ${title}`);
        currentChartRef.chartInstance.destroy();
      }
    };
  }, [title]);

  return (
    <div className="bg-cardBg p-5 text-center rounded-lg flex flex-col justify-between h-full shadow-lg text-cardBodyText border-cardBorder">
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 w-16" style={{ flex: "0 0 4rem" }}>
          <Icon className="text-4xl text-svg" />
        </div>
        <div className="flex-grow text-xl flex justify-center text-cardHeaderText" style={{ flex: "1 1 auto" }}>
          {title}
        </div>
        <div className="flex-shrink-0 w-16 flex items-end justify-end" style={{ flex: "0 0 4rem" }}></div>
      </div>
      <hr className="border-hrColor" />
      <div className="h-48">
        <Line ref={chartRef} data={generateChartData(labels, data, title)} options={chartOptions} />
      </div>
    </div>
  );
};

// Prop validation for TrendCard component
TrendCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.number).isRequired
};

const MemoizedTrendCard = memo(TrendCard);
export default MemoizedTrendCard;
