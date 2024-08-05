/* TestChart
 * Usage:
 * Add to App.jsx with import: import TestChart from "./utils/TestChart";
 *          <div className="flex-grow px-4 pb-8 bg-background h-64">
              <h1>Chart Color Update Test</h1>
              <TestChart />
            </div> 
 */

import { useRef, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import useUpdateChartColors from "../hooks/useUpdateChartColors"; // Ensure the import path is correct

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const initialData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Test Data",
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      tension: 0.1
    }
  ]
};

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

const TestChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { updateChartColors } = useUpdateChartColors(chartInstanceRef);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const newChartInstance = new ChartJS(chartRef.current, {
        type: "line",
        data: initialData,
        options: chartOptions
      });
      chartInstanceRef.current = newChartInstance;
      updateChartColors(newChartInstance);
    }
  }, [updateChartColors]);

  return <canvas ref={chartRef} />;
};

export default TestChart;
