import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const GenericTable = ({
  data,
  columns,
  paginationModel,
  totalRows,
  onPaginationChange,
  styles = {}
}) => {
  return (
    <div className={`customDataGrid ${styles.wrapper || ''}`}>
      <DataGrid
        rows={data}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        paginationModel={paginationModel}
        paginationMode="server"
        rowCount={totalRows}
        onPaginationModelChange={onPaginationChange}
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        getRowId={(row) => row.id}
        isRowSelectable={() => false}
      />
    </div>
  );
};

export default GenericTable;
