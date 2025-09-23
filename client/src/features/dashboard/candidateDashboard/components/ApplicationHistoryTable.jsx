'use client';

import React, { useMemo, useState } from 'react';
import Table from '@/components/ui/inputs/GenericTable';
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog';
import { getApplicationColumns } from './ApplicationHistoryTable.columns';
import { useDeleteApplication } from '../hooks/candidateApplications.hooks';
import { useAppRouter } from '@/helpers/redirections';

export default function ApplicationHistoryTable({ styles, data, paginationModel, setPaginationModel }) {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const { pushOpportunityDetails } = useAppRouter();
  const deleteMutation = useDeleteApplication();

  const handleViewClick = (row) => {
    pushOpportunityDetails(row.opportunity.oppId);
    console.log("row",row);
  };
  const handleDeleteClick = (row) => {
    document.activeElement?.blur();
    setSelectedApp(row);
    setWithdrawDialogOpen(true);
  };
  const handleConfirmWithdraw = () => {
    if (!selectedApp) return;

    deleteMutation.mutate(selectedApp.id, {
      onSuccess: () => {
        setWithdrawDialogOpen(false);
        setSelectedApp(null);
      }
    });
  };

  const columns = useMemo(
    () => getApplicationColumns(styles, handleViewClick, handleDeleteClick),
    [styles]
  );

  return (
    <>
      <Table
        columns={columns}
        data={(data?.applications ?? []).map((item, i) => ({
          ...item,
          rowIndex: paginationModel.page * paginationModel.pageSize + i + 1,
        }))}
        paginationModel={{
          page: data?.pageNumber ? data.pageNumber - 1 : 0,
          pageSize: data?.pageSize || paginationModel.pageSize,
        }}
        totalRows={data?.totalApplications || 0}
        onPaginationChange={setPaginationModel}
        styles={styles}
      />


      <DeleteConfirmationDialog
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        itemName={selectedApp?.title || 'this application'}
        onDelete={handleConfirmWithdraw}
      />
    </>
  );
}
