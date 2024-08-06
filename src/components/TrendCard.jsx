import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from "chart.js";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";
import useUpdateChartColors, { getChartColors } from "../hooks/useUpdateChartColors";

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

// Function to generate chart data with appropriate colors
const generateChartData = (labels, data, title) => {
  const colors = getChartColors();
  log.debug({ page: "TrendCard", component: "TrendCard", func: "generateChartData" }, `colors: ${JSON.stringify(colors)}`);
  return {
    labels: labels,
    datasets: [
      {
        label: title,
        data: data,
        fill: false,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        pointBackgroundColor: colors.pointBackgroundColor,
        pointBorderColor: colors.pointBorderColor,
        pointHoverBackgroundColor: colors.pointHoverBackgroundColor,
        pointHoverBorderColor: colors.pointHoverBorderColor,
        tension: 0.1,
        hoverBackgroundColor: colors.hoverBackgroundColor,
        hoverBorderColor: colors.hoverBorderColor
      }
    ]
  };
};

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

const TrendCard = ({ title, icon: Icon, labels, data }) => {
  const chartRef = useRef(null); // Reference to the canvas element
  const chartInstanceRef = useRef(null); // Reference to the Chart.js instance
  const { updateChartColors } = useUpdateChartColors(chartInstanceRef); // Custom hook to update chart colors

  // Effect to create the chart when the component is mounted
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d"); // Get 2D context from the canvas
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy(); // Destroy the existing chart instance if it exists
        }
        try {
          // Create a new chart instance
          const newChartInstance = new ChartJS(ctx, {
            type: "line",
            data: generateChartData(labels, data, title),
            options: chartOptions
          });
          chartInstanceRef.current = newChartInstance; // Save the new chart instance
          updateChartColors(newChartInstance); // Update the chart colors
          log.debug({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, "Chart instance created and colors updated");
        } catch (error) {
          log.error(
            { page: "TrendCard", component: "TrendCard", func: "useEffect" },
            errorHandler(error) // Handle any errors during chart creation
          );
        }
      } else {
        log.error({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, "Failed to get 2D context from canvas element");
      }
    } else {
      log.error({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, "chartRef.current is null");
    }
  }, [labels, data, title, updateChartColors]);

  // Cleanup effect to destroy the chart instance when the component unmounts
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

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
      <div className="h-64">
        <canvas ref={chartRef} /> {/* Canvas element for Chart.js */}
      </div>
    </div>
  );
};

TrendCard.propTypes = {
  title: PropTypes.string.isRequired, // Title for the trend card
  icon: PropTypes.elementType.isRequired, // Icon component for the trend card
  labels: PropTypes.arrayOf(PropTypes.string).isRequired, // Labels for the chart
  data: PropTypes.arrayOf(PropTypes.number).isRequired // Data for the chart
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedTrendCard = memo(TrendCard);
export default MemoizedTrendCard;
