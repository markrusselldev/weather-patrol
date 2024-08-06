import { useEffect, useContext, useCallback, useRef } from "react";
import { getCssVariable } from "../utils/utils";
import { ThemeContext } from "../contexts/ThemeContext";
import log from "../utils/logger";

// Function to retrieve chart colors from CSS variables
export const getChartColors = () => ({
  backgroundColor: getCssVariable("--chart-bg-color", "rgba(75, 192, 192, 0.2)"),
  borderColor: getCssVariable("--chart-line-color", "rgba(75, 192, 192, 1)"),
  pointBackgroundColor: getCssVariable("--chart-point-bg-color", "rgba(75, 192, 192, 1)"),
  pointBorderColor: getCssVariable("--chart-point-border-color", "rgba(75, 192, 192, 1)"),
  pointHoverBackgroundColor: getCssVariable("--chart-point-hover-bg-color", "rgba(255, 99, 132, 1)"),
  pointHoverBorderColor: getCssVariable("--chart-point-hover-border-color", "rgba(255, 99, 132, 1)"),
  hoverBackgroundColor: getCssVariable("--chart-hover-bg-color", "rgba(75, 192, 192, 0.2)"),
  hoverBorderColor: getCssVariable("--chart-hover-border-color", "rgba(75, 192, 192, 1)")
});

// Custom hook to update chart colors based on the current theme
const useUpdateChartColors = chartInstanceRef => {
  const { theme } = useContext(ThemeContext); // Access the current theme from the context
  const previousThemeRef = useRef(theme); // Store the previous theme to detect changes

  // Function to update chart colors
  const updateChartColors = useCallback(chart => {
    if (!chart) {
      log.error({ page: "useUpdateChartColors", func: "updateChartColors" }, "Chart instance is not available");
      return;
    }
    if (!chart.data) {
      log.error({ page: "useUpdateChartColors", func: "updateChartColors" }, "Chart data is not available");
      return;
    }
    if (!chart.data.datasets) {
      log.error({ page: "useUpdateChartColors", func: "updateChartColors" }, "Chart datasets are not available");
      return;
    }
    if (!chart.data.datasets[0]) {
      log.error({ page: "useUpdateChartColors", func: "updateChartColors" }, "First dataset is not available");
      return;
    }

    // Retrieve the current chart colors
    const colors = getChartColors();
    log.debug({ page: "useUpdateChartColors", func: "updateChartColors" }, `Updating chart colors: ${JSON.stringify(colors)}`);

    try {
      // Update each dataset's colors
      chart.data.datasets.forEach(dataset => {
        dataset.backgroundColor = colors.backgroundColor;
        dataset.borderColor = colors.borderColor;
        dataset.pointBackgroundColor = colors.pointBackgroundColor;
        dataset.pointBorderColor = colors.pointBorderColor;
        dataset.pointHoverBackgroundColor = colors.pointHoverBackgroundColor;
        dataset.pointHoverBorderColor = colors.pointHoverBorderColor;
        dataset.hoverBackgroundColor = colors.hoverBackgroundColor;
        dataset.hoverBorderColor = colors.hoverBorderColor;
      });
      chart.update(); // Apply the updates to the chart
    } catch (error) {
      log.error({ page: "useUpdateChartColors", func: "updateChartColors" }, `Error updating chart colors: ${error.message}`);
    }
  }, []);

  // Effect to update chart colors when the chart instance or theme changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (chartInstanceRef && chartInstanceRef.current) {
        updateChartColors(chartInstanceRef.current);
        clearInterval(intervalId); // Clear the interval after updating the colors
      }
    }, 100);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [chartInstanceRef, theme, updateChartColors]);

  // Effect to update chart colors when the theme changes
  useEffect(() => {
    if (theme !== previousThemeRef.current) {
      setTimeout(() => {
        if (chartInstanceRef && chartInstanceRef.current) {
          updateChartColors(chartInstanceRef.current);
        }
      }, 100);
      previousThemeRef.current = theme; // Update the previous theme reference
    }
  }, [chartInstanceRef, theme, updateChartColors]);

  return { updateChartColors }; // Return the updateChartColors function
};

export default useUpdateChartColors;
