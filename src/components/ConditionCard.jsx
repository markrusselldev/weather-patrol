import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const generateChartData = (data, title, pastTimestamps) => ({
  labels: pastTimestamps.length ? [...pastTimestamps, "Now"] : ["-60 min", "-45 min", "-30 min", "-15 min", "Now"],
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

const ConditionCard = ({ title, icon: Icon, data, unit, min, max, pastTimestamps = [], showMinMax }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = new ChartJS(chartRef.current, {
        type: "line",
        data: generateChartData(data, title, pastTimestamps),
        options: chartOptions
      });

      return () => {
        chartInstance.destroy();
      };
    }
  }, [data, title, pastTimestamps]);

  console.log(`Generating chart data for ${title}`, { data, pastTimestamps });

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
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 w-16" style={{ flex: "0 0 4rem" }}></div>
        <div className="flex-grow text-6xl flex justify-center" style={{ flex: "1 1 auto", color: "var(--data-text-color)" }}>
          {data[data.length - 1]}
          <span className="text-2xl align-top" style={{ color: "var(--data-text-color)" }}>
            {unit}
          </span>
        </div>
        {showMinMax && (
          <div className="flex-shrink-0 w-16 flex flex-col items-start" style={{ flex: "0 0 4rem" }}>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">Hi</span>{" "}
              <span className="text-sm" style={{ color: "var(--data-text-color)" }}>
                {max}
                {unit}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-breadcrumbText mr-1">Lo</span>{" "}
              <span className="text-sm" style={{ color: "var(--data-text-color)" }}>
                {min}
                {unit}
              </span>
            </div>
          </div>
        )}
        {!showMinMax && <div className="flex-shrink-0 w-16" style={{ flex: "0 0 4rem" }}></div>}
      </div>
      <hr className="border-hrColor" />
      <div className="grid grid-cols-4 gap-2 mb-2">
        {data.slice(0, -1).map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-sm" style={{ color: "var(--data-text-color)" }}>
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
  showMinMax: PropTypes.bool
};

const MemoizedConditionCard = memo(ConditionCard);
export default MemoizedConditionCard;
