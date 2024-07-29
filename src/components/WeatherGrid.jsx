import { useRef, useEffect, useMemo, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { DataContext } from "../contexts/DataContext";

const WeatherGrid = () => {
  const { columnDefs, rowData } = useContext(DataContext);
  const gridRef = useRef(null);

  // Function to auto-size columns to fit their contents
  const autoSizeAllColumns = useCallback(() => {
    if (gridRef.current && gridRef.current.columnApi) {
      const allColumns = gridRef.current.columnApi.getAllColumns();
      if (allColumns && allColumns.length > 0) {
        const allColumnIds = allColumns.map(col => col.getId());
        gridRef.current.columnApi.autoSizeColumns(allColumnIds, false);
      }
    }
  }, []);

  // Called when the grid is ready
  const onGridReady = useCallback(
    params => {
      gridRef.current.api = params.api; // Set grid API
      gridRef.current.columnApi = params.columnApi; // Set column API
      autoSizeAllColumns();
    },
    [autoSizeAllColumns]
  );

  // Function to add new row data if TIMESTAMP does not exist
  const addNewRowData = useCallback(
    newRow => {
      if (gridRef.current && gridRef.current.api) {
        const existingRows = [];
        gridRef.current.api.forEachNode(node => existingRows.push(node.data));

        const existingRow = existingRows.find(row => row.TIMESTAMP === newRow.TIMESTAMP);

        if (!existingRow) {
          console.log("Adding new row data via applyTransaction:", newRow);
          gridRef.current.api.applyTransaction({ add: [newRow], addIndex: 0 });
          autoSizeAllColumns();
          //  console.log("Grid rows redrawn.");
        } else {
          //  console.log("Row with this TIMESTAMP already exists. No new row added.");
        }
      }
    },
    [autoSizeAllColumns]
  );

  // Effect to handle row data updates only for new rows
  useEffect(() => {
    if (rowData.length > 0) {
      const latestRow = rowData[rowData.length - 1];
      addNewRowData(latestRow);
    }
  }, [rowData, addNewRowData]);

  const memoizedRowData = useMemo(() => rowData, [rowData]);
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

  return (
    <div ref={gridRef} className="ag-theme-alpine" style={{ width: "100%", height: "calc(100vh - 200px)" }}>
      <AgGridReact
        columnDefs={memoizedColumnDefs}
        rowData={memoizedRowData}
        pagination={true}
        paginationPageSize={50} // Changed the default page size to 50
        onGridReady={onGridReady}
        onFirstDataRendered={autoSizeAllColumns}
        defaultColDef={{
          resizable: true,
          maxWidth: 150, // Set maximum column width
          cellStyle: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-color)" },
          tooltipField: "value" // Adding tooltip to display the full content on hover
        }}
        paginationPanelClassName="custom-pagination"
        rowBuffer={10} // Number of rows rendered outside the viewable area
        suppressRowVirtualization={false} // Ensure row virtualization is not suppressed
        suppressColumnVirtualisation={false}
        suppressScrollLag={true} // Reduce forced reflows during scrolling
        animateRows={false} // Prevent row animations to improve performance
      />
    </div>
  );
};

WeatherGrid.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  rowData: PropTypes.array.isRequired
};

export default WeatherGrid;