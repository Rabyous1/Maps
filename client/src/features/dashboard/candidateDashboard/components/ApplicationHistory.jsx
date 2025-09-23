'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import GenericCard from '@/components/ui/surfaces/Card';
import ApplicationHistoryTable from './ApplicationHistoryTable';
import { useMyApplications } from '../hooks/candidateApplications.hooks';
import StatsGrid from './StatGrid';
import ApplicationsFilters from './ApplicationsFilters';

export default function ApplicationHistory({ styles }) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [filters, setFilters] = useState({});

  const flatFilters = {
    ...filters,
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  };

  if (filters.applicationDate?.startDate && filters.applicationDate?.endDate) {
    flatFilters.applicationDateStart = filters.applicationDate.startDate;
    flatFilters.applicationDateEnd = filters.applicationDate.endDate;
    delete flatFilters.applicationDate;
  }

  const { data} = useMyApplications(flatFilters);


  return (
    <Box className={styles.wrapper}>

      <StatsGrid styles={styles} stats={data?.stats || {}} />
      <Typography className={styles.title}>Recent Applications History</Typography>
      <ApplicationsFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({})}
        styles={styles}
      />
      <GenericCard styles={styles} className={styles.myappcard}>
        <ApplicationHistoryTable
          styles={styles}
          data={data}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
        />
      </GenericCard>
    </Box>
  );
}

