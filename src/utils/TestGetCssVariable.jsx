// src/utils/TestGetCssVariable.jsx
import { useEffect } from "react";
import { getCssVariable } from "./utils";
import log from "./logger";

const TestGetCssVariable = () => {
  useEffect(() => {
    const activeBgColor = getCssVariable("--button-active-bg-color", "hsl(355, 85%, 45%)");
    const activeTextColor = getCssVariable("--button-active-text-color", "hsl(53, 98%, 65%)");
    const inactiveBgColor = getCssVariable("--button-bg-color", "hsl(0, 0%, 90%)");
    const inactiveTextColor = getCssVariable("--button-text-color", "hsl(0, 0%, 20%)");
    const borderColor = getCssVariable("--button-border-color", "hsl(0, 0%, 80%)");

    log.debug(`Active background color: ${activeBgColor}`);
    log.debug(`Active text color: ${activeTextColor}`);
    log.debug(`Inactive background color: ${inactiveBgColor}`);
    log.debug(`Inactive text color: ${inactiveTextColor}`);
    log.debug(`Border color: ${borderColor}`);
  }, []);

  return <div>Check console for CSS variable values</div>;
};

export default TestGetCssVariable;
