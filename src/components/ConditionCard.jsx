import { useRef, useEffect, memo } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { WiWindDeg } from "react-icons/wi";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";
import useUpdateChartColors, { getChartColors } from "../hooks/useUpdateChartColors";

// Registering ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Function to generate chart data
const generateChartData = (data, title, pastTimestamps) => {
  const colors = getChartColors();
  log.debug(
    {
      page: "src/components/ConditionCard.jsx",
      component: "ConditionCard",
      func: "generateChartData"
    },
    `colors: ${JSON.stringify(colors)}`
  );

  const parsedData = typeof data === "string" ? JSON.parse(data) : data;
  const parsedTimestamps = typeof pastTimestamps === "string" ? JSON.parse(pastTimestamps) : pastTimestamps;

  return {
    labels: parsedTimestamps.length ? [...parsedTimestamps, "Now"] : ["-60 min", "-45 min", "-30 min", "-15 min", "Now"],
    datasets: [
      {
        label: title,
        data: parsedData,
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
  },
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const element = elements[0];
      const dataset = element.datasetIndex;
      const index = element.index;
      log.info(
        {
          page: "src/components/ConditionCard.jsx",
          component: "ConditionCard",
          func: "onClick"
        },
        `Clicked on dataset index: ${dataset}, data index: ${index}`
      );
    }
  }
};

// Main component
const ConditionCard = ({ title, icon: Icon, data, unit, min, max, pastTimestamps = [], showMinMax, cardinalDirection }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { updateChartColors } = useUpdateChartColors(chartInstanceRef);

  // Effect to handle chart instance creation and updates
  useEffect(() => {
    if (chartRef.current) {
      try {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        chartInstanceRef.current = new ChartJS(chartRef.current, {
          type: "line",
          data: generateChartData(data, title, pastTimestamps),
          options: chartOptions
        });
        updateChartColors(chartInstanceRef.current);
        log.debug(
          {
            page: "src/components/ConditionCard.jsx",
            component: "ConditionCard",
            func: "useEffect"
          },
          "Chart instance created and colors updated"
        );
      } catch (error) {
        log.error(
          {
            page: "src/components/ConditionCard.jsx",
            component: "ConditionCard",
            func: "useEffect"
          },
          errorHandler(error)
        );
      }
    }

    // Cleanup function to destroy chart instance
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
        log.debug(
          {
            page: "src/components/ConditionCard.jsx",
            component: "ConditionCard",
            func: "useEffect"
          },
          "Chart instance destroyed"
        );
      }
    };
  }, [data, title, pastTimestamps, updateChartColors]);

  log.debug(
    {
      page: "src/components/ConditionCard.jsx",
      component: "ConditionCard",
      func: "render"
    },
    `Generating chart data for ${title}`,
    { data: JSON.stringify(data), pastTimestamps: JSON.stringify(pastTimestamps) }
  );

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
          {Array.isArray(data) ? data[data.length - 1] : data}
          <span className="text-2xl align-top text-dataText">{unit}</span>
        </div>
        {showMinMax ? (
          <div className="flex-shrink-0 w-16 flex flex-col items-end pr-6" style={{ flex: "0 0 4rem" }}>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">Hi</span>
              <span className="text-sm text-dataText">
                {max}
                <span className="text-xs align-top text-breadcrumbText">{unit}</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">Lo</span>
              <span className="text-sm text-dataText">
                {min}
                <span className="text-xs align-top text-breadcrumbText">{unit}</span>
              </span>
            </div>
          </div>
        ) : cardinalDirection ? (
          <div className="flex-shrink-0 w-16 flex flex-col items-start" style={{ flex: "0 0 4rem" }}>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">
                <WiWindDeg className="text-2xl" style={{ transform: `rotate(${Array.isArray(data) ? data[data.length - 1] : data}deg)` }} />
              </span>
              <span className="text-sm text-dataText">{cardinalDirection}</span>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 w-16" style={{ flex: "0 0 4rem" }}></div>
        )}
      </div>
      <hr className="border-hrColor" />
      <div className="grid grid-cols-4 gap-2 mb-2">
        {Array.isArray(data) &&
          data.slice(0, -1).map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-sm text-dataText">
                {value}
                <span className="text-xs align-top text-breadcrumbText">{unit}</span>
              </span>
              <span className="text-xs text-breadcrumbText">{pastTimestamps[index] || "N/A"}</span>
            </div>
          ))}
      </div>
      <hr className="border-hrColor" />
      <div className="h-24">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  );
};

// PropTypes validation
ConditionCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  data: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.number), PropTypes.string]).isRequired,
  unit: PropTypes.string.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  pastTimestamps: PropTypes.arrayOf(PropTypes.string),
  showMinMax: PropTypes.bool,
  cardinalDirection: PropTypes.string
};

// Memoized component to prevent unnecessary re-renders
const MemoizedConditionCard = memo(ConditionCard);
export default MemoizedConditionCard;
