import { useRef, useEffect, useMemo, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";
import { DataContext } from "../contexts/DataContext";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";
import { formatTimestamp } from "../utils/utils";
import { FaSpinner } from "react-icons/fa"; // Import loading spinner icon

const WeatherGrid = () => {
  const { columnDefs, weatherData, error, loading } = useContext(DataContext);
  const gridRef = useRef(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  // Check if the necessary CSS variables are applied
  useEffect(() => {
    const checkStylesLoaded = () => {
      // Create a temporary element to check for the application of CSS variables
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);

      const computedStyle = window.getComputedStyle(testElement);
      const tableBorderColor = computedStyle.getPropertyValue('--table-border-color');
      const tableThBg = computedStyle.getPropertyValue('--table-th-bg-color');
      const tableThText = computedStyle.getPropertyValue('--table-th-text-color');
      const tableTdText = computedStyle.getPropertyValue('--table-td-text-color');
      const tableRowAltBg = computedStyle.getPropertyValue('--table-row-alt-bg-color');
      const dataText = computedStyle.getPropertyValue('--data-text-color');

      // Check if all the required CSS variables are applied
      if (tableBorderColor && tableThBg && tableThText && tableTdText && tableRowAltBg && dataText) {
        log.info("All required CSS variables are loaded, indicating styles are applied.");
        setStylesLoaded(true);
      } else {
        log.warn("Not all required CSS variables are loaded yet.");
      }

      document.body.removeChild(testElement);
    };

    // Use setTimeout to delay the check, allowing styles to load
    const timeoutId = setTimeout(checkStylesLoaded, 100); // Adjust the delay as needed

    // Fallback: if styles are not loaded within 1 second, proceed to load the grid
    const fallbackTimeout = setTimeout(() => {
      log.error("Styles did not load within expected time. Proceeding with grid load.");
      setStylesLoaded(true);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Function to auto-size all columns to fit their contents
  const autoSizeAllColumns = useCallback(() => {
    if (gridRef.current && gridRef.current.columnApi) {
      const allColumns = gridRef.current.columnApi.getAllColumns();
      if (allColumns && allColumns.length > 0) {
        const allColumnIds = allColumns.map(col => col.getId());
        gridRef.current.columnApi.autoSizeColumns(allColumnIds, false);
      }
    }
  }, []);

  // Callback for when the grid is ready
  const onGridReady = useCallback(
    params => {
      log.info({ page: "WeatherGrid", component: "WeatherGrid", func: "onGridReady" }, "Grid is ready");
      gridRef.current.api = params.api;
      gridRef.current.columnApi = params.columnApi;
      autoSizeAllColumns();
    },
    [autoSizeAllColumns]
  );

  // Function to add new row data if the TIMESTAMP does not exist
  const addNewRowData = useCallback(
    newRow => {
      if (gridRef.current && gridRef.current.api) {
        const existingRows = [];
        gridRef.current.api.forEachNode(node => existingRows.push(node.data));

        const existingRow = existingRows.find(row => row.TIMESTAMP === newRow.TIMESTAMP);

        // Only add new row if TIMESTAMP does not already exist
        if (!existingRow) {
          log.info({ page: "WeatherGrid", component: "WeatherGrid", func: "addNewRowData" }, "Adding new row data:", JSON.stringify(newRow, null, 2));
          gridRef.current.api.applyTransaction({ add: [newRow], addIndex: 0 });
          autoSizeAllColumns();
        } else {
          log.info({ page: "WeatherGrid", component: "WeatherGrid", func: "addNewRowData" }, "Row with this TIMESTAMP already exists. No new row added.");
        }
      }
    },
    [autoSizeAllColumns]
  );

  // Effect to handle row data updates only for new rows
  useEffect(() => {
    if (weatherData.length > 0) {
      const latestRow = weatherData[0];
      log.info({ page: "WeatherGrid", component: "WeatherGrid", func: "useEffect for weatherData" }, "Latest weather data row:", JSON.stringify(latestRow, null, 2));
      addNewRowData(latestRow);
    }
  }, [weatherData, addNewRowData]);

  // Memoize column definitions to include a value formatter for the TIMESTAMP column
  const memoizedColumnDefs = useMemo(() => {
    return columnDefs.map(colDef => {
      if (colDef.field === "TIMESTAMP") {
        return {
          ...colDef,
          valueFormatter: params => formatTimestamp(params.value, { showTime: true, showDate: true })
        };
      }
      return colDef;
    });
  }, [columnDefs]);

  // Memoize row data to prevent unnecessary re-renders
  const memoizedRowData = useMemo(() => weatherData, [weatherData]);

  // Logging current state for debugging
  useEffect(() => {
    log.info({ page: "WeatherGrid", component: "WeatherGrid", func: "useEffect for logging" }, "WeatherGrid columnDefs:", JSON.stringify(memoizedColumnDefs, null, 2));
    log.info({ page: "WeatherGrid", component: "WeatherGrid", func: "useEffect for logging" }, "WeatherGrid rowData:", JSON.stringify(memoizedRowData, null, 2));
  }, [memoizedColumnDefs, memoizedRowData]);

  // Additional logging before rendering the component
  useEffect(() => {
    log.debug({ page: "WeatherGrid", component: "WeatherGrid", func: "useEffect for rendering" }, "Rendering WeatherGrid");
  }, [columnDefs, weatherData]);

  // Process error using errorHandler
  const processedError = error ? errorHandler(error) : null;

  return (
    <div ref={gridRef} className="ag-theme-alpine" style={{ width: "100%", height: "calc(100vh - 215px)" }}>
      {processedError && <div className="error">{processedError}</div>}
      {loading || !stylesLoaded ? (
        <div className="flex justify-center items-center h-full">
          <FaSpinner className="animate-spin text-3xl text-gray-300" />
        </div>
      ) : memoizedColumnDefs && memoizedRowData.length > 0 ? (
        <AgGridReact
          columnDefs={memoizedColumnDefs}
          rowData={memoizedRowData}
          modules={[ClientSideRowModelModule, CsvExportModule, InfiniteRowModelModule]}
          pagination={true}
          paginationPageSize={50} // Set default page size
          onGridReady={onGridReady} // Grid ready callback
          onFirstDataRendered={autoSizeAllColumns} // Auto-size columns when first data is rendered
          defaultColDef={{
            resizable: true, // Allow columns to be resized
            filter: true, // Enable filtering for all columns
            width: 160, // Set initial column width
            cellStyle: {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            headerClass: "custom-header" // Apply custom header class
          }}
          getRowStyle={params => ({
            backgroundColor: params.node.rowIndex % 2 === 0 ? "var(--table-row-alt-bg-color, #00ff00)" : "inherit" // Apply custom CSS variable with green fallback for alternate row background color
          })}
          paginationPanelClassName="custom-pagination"
          rowBuffer={10} // Number of rows rendered outside the viewable area
          suppressRowVirtualization={false} // Ensure row virtualization is not suppressed
          suppressColumnVirtualisation={false}
          suppressScrollLag={true} // Reduce forced reflows during scrolling
          animateRows={false} // Prevent row animations to improve performance
        />
      ) : (
        <div className="flex justify-center items-center h-full">
          <FaSpinner className="animate-spin text-sm text-gray-300" />
        </div>
      )}
    </div>
  );
};

WeatherGrid.propTypes = {
  columnDefs: PropTypes.array.isRequired, // Prop types validation for columnDefs
  rowData: PropTypes.array.isRequired // Prop types validation for rowData
};

export default WeatherGrid;
