import { useEffect, useContext, useCallback, useRef } from "react";
import { getCssVariable } from "../utils/utils";
import { ThemeContext } from "../contexts/ThemeContext";
import log from "../utils/logger";

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

const useUpdateChartColors = chartInstanceRef => {
  const { theme } = useContext(ThemeContext);
  const previousThemeRef = useRef(theme);

  const updateChartColors = useCallback(chart => {
    const colors = getChartColors();
    log.debug("Updating chart colors:", colors);
    chart.data.datasets[0].backgroundColor = colors.backgroundColor;
    chart.data.datasets[0].borderColor = colors.borderColor;
    chart.data.datasets[0].pointBackgroundColor = colors.pointBackgroundColor;
    chart.data.datasets[0].pointBorderColor = colors.pointBorderColor;
    chart.data.datasets[0].pointHoverBackgroundColor = colors.pointHoverBackgroundColor;
    chart.data.datasets[0].pointHoverBorderColor = colors.pointHoverBorderColor;
    chart.data.datasets[0].hoverBackgroundColor = colors.hoverBackgroundColor;
    chart.data.datasets[0].hoverBorderColor = colors.hoverBorderColor;
    chart.update();
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      updateChartColors(chartInstanceRef.current);
    }
  }, [chartInstanceRef, theme, updateChartColors]);

  useEffect(() => {
    if (theme !== previousThemeRef.current) {
      setTimeout(() => {
        if (chartInstanceRef.current) {
          updateChartColors(chartInstanceRef.current);
        }
      }, 100);
      previousThemeRef.current = theme;
    }
  }, [chartInstanceRef, theme, updateChartColors]);

  return { updateChartColors };
};

export default useUpdateChartColors;
