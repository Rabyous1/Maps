import React, { useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Table from '@/components/ui/inputs/GenericTable';
import GenericCard from '@/components/ui/surfaces/Card';
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog';
import { getFavoriteOpportunitiesColumns } from './FavoriteOpportunitiesTable.Columns';
import { useFavoriteOpportunities, useRemoveFromFavorites } from '../../hooks/opportunities.hooks';

export default function FavoriteOpportunities({
  styles,
  setTotal,
}) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { page, pageSize } = paginationModel;

  const [opportunityToUnsave, setOpportunityToUnsave] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const params = {
    pageNumber: page + 1,  
    pageSize,
  };

  const removeFromFavoritesMutation = useRemoveFromFavorites();

  const handleUnsaveClick = (row) => {
    setOpportunityToUnsave(row);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!opportunityToUnsave) return;
    removeFromFavoritesMutation.mutate(opportunityToUnsave.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setOpportunityToUnsave(null);
      },
    });
  };

  const columns = useMemo(
    () => getFavoriteOpportunitiesColumns(styles, handleUnsaveClick),
    [styles]
  );

  const { data, isLoading, isError, refetch } = useFavoriteOpportunities(
    params,
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        if (setTotal && data?.totalFavorites != null) {
          setTotal(data.totalFavorites);
        }
      },
    }
  );

  if (isLoading || !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" color="error.main">
        <p>Error loading favorites.</p>
        <button onClick={() => refetch()}>Retry</button>
      </Box>
    );
  }

  return (
    <>
      <p className={styles.savedOpportunitiesTitle}>
        Saved Opportunities List
        <span className={styles.savedOpportunitiesTotal}> ({data.totalFavorites} total)</span>
      </p>
      <GenericCard styles={styles}>
        <Table
          columns={columns}
          data={data.favorites.map((item, i) => ({
            ...item,
            rowIndex: page * pageSize + i + 1,
          }))}
          paginationModel={{
            page: data.pageNumber - 1,
            pageSize: data.pageSize,
          }}
          totalRows={data.totalFavorites}
          onPaginationChange={setPaginationModel}
          styles={styles}
        />
      </GenericCard>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        itemName={opportunityToUnsave?.title + " from your favorites list" || 'this opportunity'}
        onDelete={handleConfirmDelete}
      />
    </>
  );
}
