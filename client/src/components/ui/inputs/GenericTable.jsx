import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress } from "@mui/material";

const Table = ({
  columns,
  data,
  paginationModel,
  totalRows,
  loading,
  onPaginationChange,
  styles,
}) => {
  return (
    <Box>
      {loading ? (
        <Box>
          <CircularProgress />
        </Box>
      ) : (
          <Box className={styles.tableWrapper}>
            <DataGrid
              className={styles?.customDataGrid}
              rows={data}
              columns={columns.map((col) => ({
                ...col,
                headerClassName: styles?.customDataGrid,
              }))}
              rowCount={totalRows}
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationChange}
              pageSizeOptions={[5, 10, 25, 50]}
              paginationMode="server"
              getRowId={(row) => row.id}
              disableColumnMenu
              
              sx={{
                '.MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
              }}
            />
          </Box>
      )}
    </Box>
  );
};

export default Table;
