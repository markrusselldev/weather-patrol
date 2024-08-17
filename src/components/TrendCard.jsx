import { useEffect, useRef, memo, useContext } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from "chart.js";
import { ThemeContext } from "../contexts/ThemeContext";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

const generateChartData = (labels, data, title) => {
  const rootStyle = getComputedStyle(document.documentElement);

  return {
    labels: labels,
    datasets: [
      {
        label: title,
        data: data,
        fill: false,
        backgroundColor: rootStyle.getPropertyValue('--chart-bg-color').trim(),
        borderColor: rootStyle.getPropertyValue('--chart-line-color').trim(),
        pointBackgroundColor: rootStyle.getPropertyValue('--chart-point-bg-color').trim(),
        pointBorderColor: rootStyle.getPropertyValue('--chart-point-border-color').trim(),
        pointHoverBackgroundColor: rootStyle.getPropertyValue('--chart-point-hover-bg-color').trim(),
        pointHoverBorderColor: rootStyle.getPropertyValue('--chart-point-hover-border-color').trim(),
        tension: 0.4,
        hoverBackgroundColor: rootStyle.getPropertyValue('--chart-hover-bg-color').trim(), 
        hoverBorderColor: rootStyle.getPropertyValue('--chart-hover-border-color').trim(),
      }
    ]
  };
};

const updateChartColors = (chartInstance) => {
  if (chartInstance && chartInstance.data && chartInstance.data.datasets) {
    const rootStyle = getComputedStyle(document.documentElement);

    chartInstance.data.datasets.forEach(dataset => {
      dataset.backgroundColor = rootStyle.getPropertyValue('--chart-bg-color').trim();
      dataset.borderColor = rootStyle.getPropertyValue('--chart-line-color').trim();
      dataset.pointBackgroundColor = rootStyle.getPropertyValue('--chart-point-bg-color').trim();
      dataset.pointBorderColor = rootStyle.getPropertyValue('--chart-point-border-color').trim();
      dataset.pointHoverBackgroundColor = rootStyle.getPropertyValue('--chart-point-hover-bg-color').trim();
      dataset.pointHoverBorderColor = rootStyle.getPropertyValue('--chart-point-hover-border-color').trim();
      dataset.hoverBackgroundColor = rootStyle.getPropertyValue('--chart-hover-bg-color').trim();
      dataset.hoverBorderColor = rootStyle.getPropertyValue('--chart-hover-border-color').trim();
    });

    chartInstance.update(); // Re-render the chart with updated colors
  }
};

const TrendCard = ({ title, icon: Icon, labels, data }) => {
  const chartRef = useRef(null); // Reference to the canvas element
  const chartInstanceRef = useRef(null); // Reference to the Chart.js instance
  const { theme } = useContext(ThemeContext); // Access the current theme from the context

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d"); // Get 2D context from the canvas
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy(); // Destroy the existing chart instance if it exists
        }
        try {
          const newChartInstance = new ChartJS(ctx, {
            type: "line",
            data: generateChartData(labels, data, title),
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  type: "category"
                },
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                legend: {
                  labels: {
                    boxWidth: 20
                  }
                }
              }
            }
          });
          chartInstanceRef.current = newChartInstance; // Save the new chart instance
          log.debug({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, "Chart instance created");
        } catch (error) {
          log.error(
            { page: "TrendCard", component: "TrendCard", func: "useEffect" },
            errorHandler(error)
          );
        }
      } else {
        log.error({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, "Failed to get 2D context from canvas element");
      }
    } else {
      log.error({ page: "TrendCard", component: "TrendCard", func: "useEffect" }, "chartRef.current is null");
    }
  }, [labels, data, title]);

  useEffect(() => {
    // Trigger chart update explicitly after theme change
    setTimeout(() => {
      if (chartInstanceRef.current) {
        updateChartColors(chartInstanceRef.current); // Update colors after theme is applied
      }
    }, 100); // Increased timeout to 100ms
  }, [theme, labels, data, title]);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-cardBg p-5 text-center rounded-lg flex flex-col justify-between h-full shadow-lg text-cardBodyText border-cardBorderColor border">
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

const MemoizedTrendCard = memo(TrendCard);
export default MemoizedTrendCard;
