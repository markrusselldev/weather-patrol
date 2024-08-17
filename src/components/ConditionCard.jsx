import { useRef, useEffect, useContext, memo } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { WiWindDeg } from "react-icons/wi";
import { ThemeContext } from "../contexts/ThemeContext";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const generateChartData = (data, title, pastTimestamps) => {
  const parsedData = Array.isArray(data) ? data : JSON.parse(data);
  const parsedTimestamps = Array.isArray(pastTimestamps) ? pastTimestamps : JSON.parse(pastTimestamps);

  const rootStyle = getComputedStyle(document.documentElement);

  return {
    labels: parsedTimestamps.length ? [...parsedTimestamps, "Now"] : ["-60 min", "-45 min", "-30 min", "-15 min", "Now"],
    datasets: [
      {
        label: title,
        data: parsedData,
        fill: false,
        backgroundColor: rootStyle.getPropertyValue('--chart-bg-color').trim(),
        borderColor: rootStyle.getPropertyValue('--chart-line-color').trim(),
        pointBackgroundColor: rootStyle.getPropertyValue('--chart-point-bg-color').trim(),
        pointBorderColor: rootStyle.getPropertyValue('--chart-point-border-color').trim(),
        pointHoverBackgroundColor: rootStyle.getPropertyValue('--chart-point-hover-bg-color').trim(),
        pointHoverBorderColor: rootStyle.getPropertyValue('--chart-point-hover-border-color').trim(),
        tension: 0.1,
        hoverBackgroundColor: rootStyle.getPropertyValue('--chart-hover-bg-color').trim(),
        hoverBorderColor: rootStyle.getPropertyValue('--chart-hover-border-color').trim()
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

    chartInstance.update();
  }
};

const ConditionCard = ({ title, icon: Icon, data, unit, min, max, pastTimestamps = [], showMinMax, cardinalDirection }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const createChartInstance = () => {
      if (chartRef.current) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        try {
          chartInstanceRef.current = new ChartJS(chartRef.current, {
            type: "line",
            data: generateChartData(data, title, pastTimestamps),
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
              }
            }
          });
          log.debug({ page: "src/components/ConditionCard.jsx", component: "ConditionCard", func: "createChartInstance" }, "New chart instance created");
        } catch (error) {
          log.error({ page: "src/components/ConditionCard.jsx", component: "ConditionCard", func: "createChartInstance" }, errorHandler(error));
        }
      }
    };

    createChartInstance();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
        log.debug({ page: "src/components/ConditionCard.jsx", component: "ConditionCard", func: "useEffect" }, "Chart instance destroyed on cleanup");
      }
    };
  }, [data, title, pastTimestamps]);

  useEffect(() => {
    // Update chart colors when the theme changes
    setTimeout(() => {
      if (chartInstanceRef.current) {
        updateChartColors(chartInstanceRef.current);
      }
    }, 100); // Increased timeout to 100ms
  }, [theme]);

  return (
    <div className="p-5 text-center rounded-lg flex flex-col justify-between h-full shadow-md bg-cardBg text-cardBodyText border-cardBorderColor border">
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
                <span className="text-xs text-breadcrumbText">{unit}</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">Lo</span>
              <span className="text-sm text-dataText">
                {min}
                <span className="text-xs text-breadcrumbText">{unit}</span>
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
                <span className="text-xs text-breadcrumbText">{unit}</span>
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

const MemoizedConditionCard = memo(ConditionCard);
export default MemoizedConditionCard;
