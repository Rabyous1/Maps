'use client';

import React, { useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Table from '@/components/ui/inputs/GenericTable';
import GenericCard from '@/components/ui/surfaces/Card';
import { getOpportunitiesColumns } from './OpportunitiesTable.Columns';
import { useArchiveOpportunity, useDeleteOpportunity, useMyOpportunities } from '../hooks/opportunities.hooks';
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog';
import { useAppRouter } from '@/helpers/redirections';

export default function OpportunitiesTable({ filters, styles,setTotal }) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const deleteMutation = useDeleteOpportunity();
  const archiveMutation = useArchiveOpportunity();
  const { pushOpportunityDetails,pushOpportunityDetailsEdit } = useAppRouter();


  const handleViewClick = (row) => {
     sessionStorage.setItem("lastVisitedPage", window.location.pathname);
    pushOpportunityDetails(row.id);
  };
  const handleDeleteClick = (row) => {
    setSelectedOpportunity(row);
    setDeleteDialogOpen(true);
  };
  const handleEditClick = (row) => {
    pushOpportunityDetailsEdit(row.id);
  };
  
  const handleConfirmDelete = () => {
    if (!selectedOpportunity) return;

    deleteMutation.mutate(selectedOpportunity.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedOpportunity(null);
      },
    });
  };
const handleArchiveClick = (row) => {
  archiveMutation.mutate({
    id: row.id,
    isArchived: !row.isArchived, 
  });
};

const cleanFilters = Object.entries(filters).reduce((acc, [key, val]) => {
  if (val === '' || val == null) return acc
  if (typeof val === 'boolean' && val === false) return acc

  acc[key] = val
  return acc
}, {})


  const params = {
    pageNumber: paginationModel.page + 1,  
    pageSize: paginationModel.pageSize,
    ...cleanFilters,
  };


  const columns = useMemo(() => getOpportunitiesColumns(styles, handleDeleteClick, handleViewClick,handleEditClick,handleArchiveClick), [styles]);

  const { data, isLoading, isError } = useMyOpportunities(params, {
    onSuccess: (data) => {
      if (data?.total != null) {
        setTotal(data.total);
      }
    },
  });
  if (isLoading || !data) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Box>Error fetching opportunities.</Box>;
  }

  return (
    <>
      <GenericCard styles={styles}>
        <Table
          columns={columns}
          data={
            data.opportunities.map((item, i) => ({
              ...item,
              rowIndex: paginationModel.page * paginationModel.pageSize + i + 1,
            })) || []
          }
          paginationModel={{
            page: data.pageNumber - 1, 
            pageSize: data.pageSize,
          }}
          totalRows={data.total}
          onPaginationChange={setPaginationModel}
          styles={styles}
        />
      </GenericCard>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        itemName={selectedOpportunity?.title + ' opportunity' || 'this opportunity'}
        onDelete={handleConfirmDelete}
      />
    </>
  );
}
