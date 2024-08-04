import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { WiWindDeg } from "react-icons/wi";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";
import { getCssVariable } from "../utils/utils";

// Registering ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Function to generate chart data
const generateChartData = (data, title, pastTimestamps) => ({
  labels: pastTimestamps.length ? [...pastTimestamps, "Now"] : ["-60 min", "-45 min", "-30 min", "-15 min", "Now"],
  datasets: [
    {
      label: title,
      data: data,
      fill: false,
      backgroundColor: getCssVariable("--chart-bg-color", "rgba(75, 192, 192, 0.2)"), // Line fill color
      borderColor: getCssVariable("--chart-line-color", "rgba(75, 192, 192, 1)"), // Line border color
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

// Chart options for the line chart
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
  },
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const element = elements[0];
      const dataset = element.datasetIndex;
      const index = element.index;
      log.info({ page: "ConditionCard", component: "ConditionCard", func: "onClick" }, `Clicked on dataset index: ${dataset}, data index: ${index}`);
      // Handle the click event here
    }
  }
};

const ConditionCard = ({ title, icon: Icon, data, unit, min, max, pastTimestamps = [], showMinMax, cardinalDirection }) => {
  const chartRef = useRef(null);

  // Effect to create and destroy the chart instance
  useEffect(() => {
    if (chartRef.current) {
      try {
        const chartInstance = new ChartJS(chartRef.current, {
          type: "line",
          data: generateChartData(data, title, pastTimestamps),
          options: chartOptions
        });

        return () => {
          chartInstance.destroy();
        };
      } catch (error) {
        log.error({ page: "ConditionCard", component: "ConditionCard", func: "useEffect" }, errorHandler(error));
      }
    }
  }, [data, title, pastTimestamps]);

  log.debug({ page: "ConditionCard", component: "ConditionCard", func: "render" }, `Generating chart data for ${title}`, { data, pastTimestamps });

  return (
    <div className="p-5 text-center rounded-lg flex flex-col justify-between h-full shadow-md bg-cardBg text-cardBodyText border-cardBorder">
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
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 w-16" style={{ flex: "0 0 4rem" }}></div>
        <div className="flex-grow text-6xl flex justify-center text-dataText" style={{ flex: "1 1 auto" }}>
          {data[data.length - 1]}
          <span className="text-2xl align-top text-dataText">{unit}</span>
        </div>
        {showMinMax ? (
          <div className="flex-shrink-0 w-16 flex flex-col items-start" style={{ flex: "0 0 4rem" }}>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">Hi</span>{" "}
              <span className="text-sm text-dataText">
                {max}
                {unit}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">Lo</span>{" "}
              <span className="text-sm text-dataText">
                {min}
                {unit}
              </span>
            </div>
          </div>
        ) : cardinalDirection ? (
          <div className="flex-shrink-0 w-16 flex flex-col items-start" style={{ flex: "0 0 4rem" }}>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">
                <WiWindDeg className="text-2xl" style={{ transform: `rotate(${data[data.length - 1]}deg)` }} />
              </span>{" "}
              <span className="text-sm text-dataText">{cardinalDirection}</span>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 w-16" style={{ flex: "0 0 4rem" }}></div>
        )}
      </div>
      <hr className="border-hrColor" />
      <div className="grid grid-cols-4 gap-2 mb-2">
        {data.slice(0, -1).map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-sm text-dataText">
              {value}
              {unit}
            </span>
            <span className="text-xs text-breadcrumbText">{pastTimestamps[index] || "N/A"}</span>
          </div>
        ))}
      </div>
      <hr className="border-hrColor" />
      <div className="h-24">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

ConditionCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  unit: PropTypes.string.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  pastTimestamps: PropTypes.arrayOf(PropTypes.string).isRequired,
  showMinMax: PropTypes.bool,
  cardinalDirection: PropTypes.string
};

const MemoizedConditionCard = memo(ConditionCard);
export default MemoizedConditionCard;
