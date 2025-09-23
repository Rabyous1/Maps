'use client';

import React, { useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import GenericCard from '@/components/ui/surfaces/Card';
import Table from '@/components/ui/inputs/GenericTable';
import { useCandidatesList, useUpdateInterestStatus } from '../../hooks/applications.hooks';
import { getCandidatesColumns } from './CandidatesTable.Columns';
import ApplicationsReturnButton from '../ApplicationsReturnButton';
import { useAppRouter } from '@/helpers/redirections';
import CandidatesFilters from './CandidatesFilters';

export default function CandidatesTable({ styles, opportunityId }) {
  const { pushChat } = useAppRouter();
  const updateInterestMutation = useUpdateInterestStatus();

  const [interestFilter, setInterestFilter] = useState('');
  const [hasCvVideo, setHasCvVideo] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  const params = {
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    interest: interestFilter || undefined,
    hasCvVideo: hasCvVideo === true ? 'true' : undefined,
    search: searchQuery || undefined,
  };

  const { data, isLoading, isError } = useCandidatesList(opportunityId, params);

  const handleFilterChange = (key, value) => {
    switch (key) {
      case 'interest':
        setInterestFilter(value);
        break;
      case 'hasCvVideo':
        setHasCvVideo(value);
        break;
      case 'search':
        setSearchQuery(value);
        break;
    }
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleInterestChange = (applicationId, newValue) => {
    updateInterestMutation.mutate({ applicationId, interest: newValue });
  };
  const handleView = linkedinLink => {
    if (linkedinLink) window.open(linkedinLink, '_blank');
  };
  const handleMessage = () => pushChat();
  const handleSchedule = id => console.log('Schedule:', id);

  const columns = useMemo(
    () => getCandidatesColumns(styles, handleInterestChange, handleView, handleMessage, handleSchedule),
    [styles]
  );

  if (isLoading || !data) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Box p={2}>Error loading candidates</Box>;
  }

  const rows = data.candidates.map(item => ({
    ...item.candidate,
    applicationStatus: item.status,
    applicationId: item.applicationId,
    applicationDate: item.applicationDate,
    resumeDisplayName: item.resumeDisplayName,
    resumeVideoDisplayName: item.resumeVideoDisplayName,
    interest: item.interest,
  }));

  return (
    <>
      <ApplicationsReturnButton styles={styles} />
      <p className={styles.candidatesTitle}>Candidates List</p>
      <GenericCard styles={styles} className={styles.candidatesListCard}>
        <CandidatesFilters
          styles={styles}
          filters={{ interest: interestFilter, hasCvVideo, search: searchQuery }}
          onFilterChange={handleFilterChange}
        />
        <Table
          columns={columns}
          data={rows}
          paginationModel={{ page: data.pageNumber - 1, pageSize: data.pageSize }}
          totalRows={data.total}
          onPaginationChange={setPaginationModel}
          styles={styles}
        />
      </GenericCard>
    </>
  );
}

