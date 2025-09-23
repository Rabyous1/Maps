'use client';

import React, { useState, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import GenericCard from '@/components/ui/surfaces/Card';
import Table from '@/components/ui/inputs/GenericTable';
import ApplicationsFilters from './ApplicationsFilters';
import { getJobsColumns } from './ApplicationsTable.Columns';
import { useMyApplications } from '../hooks/applications.hooks';
import { useAppRouter } from '@/helpers/redirections';

const defaultFilters = {
  jobTitleFilter: '',
  locationFilter: '',
  statusFilter: '',
  industryFilter: '',
  applicationDateRange: { startDate: null, endDate: null },
  hasCvVideo: undefined,
};

export default function ApplicationsTable({ styles, filters = {} }) {
  const { pushOpportunityDetails, pushCandidatesList } = useAppRouter();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [filtersState, setFiltersState] = useState({ ...defaultFilters });
  const [appliedSearchFilters, setAppliedSearchFilters] = useState({
    jobTitleFilter: '',
    locationFilter: '',
  });

  const updateFilter = (key, value) => {
  setFiltersState((prev) => ({ ...prev, [key]: value }));
  setPaginationModel((prev) => ({ ...prev, page: 0 }));

  if (key === 'jobTitleFilter' || key === 'locationFilter') {
    if (value === '') {
      setAppliedSearchFilters((prev) => ({ ...prev, [key]: '' }));
    }
  } else {
    setAppliedSearchFilters((prev) => ({ ...prev, [key]: value }));
  }
};


  const handleApplyFilters = () => {
    setAppliedSearchFilters({
      jobTitleFilter: filtersState.jobTitleFilter,
      locationFilter: filtersState.locationFilter,
    });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const mergedFilters = {
    ...filters,
    ...filtersState,
    ...appliedSearchFilters,
  };

  const cleanFilters = Object.entries(mergedFilters).reduce((acc, [key, value]) => {
    if (
      value === '' ||
      value == null ||
      (typeof value === 'boolean' && !value) ||
      (key === 'applicationDateRange' && !value.startDate && !value.endDate)
    ) return acc;
    acc[key] = value;
    return acc;
  }, {});

  const params = {
    pageNumber: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    applicationStatus: cleanFilters.statusFilter,
    applicationDateStart: cleanFilters.applicationDateRange?.startDate,
    applicationDateEnd: cleanFilters.applicationDateRange?.endDate,
    jobTitleFilter: cleanFilters.jobTitleFilter,
    locationFilter: cleanFilters.locationFilter,
    industryFilter: cleanFilters.industryFilter,
    hasCvVideo: cleanFilters.hasCvVideo,
  };

  const { data, isLoading, isError } = useMyApplications(params);

const columns = useMemo(
  () => getJobsColumns(styles, (row) => pushCandidatesList(row.id), (row) => {
    sessionStorage.setItem('lastVisitedPage', window.location.pathname);
    pushOpportunityDetails(row.id);
  }),
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
    return <Box p={2}>Error loading applications</Box>;
  }

  const rows = data.jobs.map((job) => {
    const lastApplied = job.applications?.map(a => a.applicationDate).sort().pop() || null;
    return {
      id: job.opportunityId,
      jobTitle: job.jobTitle,
      status: job.status,
      industry: job.industry,
      country: job.country,
      city: job.city,
      totalApplications: job.totalApplications,
      lastApplied,
      averageExperience: job.averageExperience,
      videoCvCount: job.videoCvCount,
      applications: job.applications,
      totalPagesApplications: job.totalPagesApplications,
    };
  });

  return (
    <div className={styles.applicationsContent}>
      <ApplicationsFilters
        styles={styles}
        filters={filtersState}
        onFilterChange={updateFilter}
        onSearch={handleApplyFilters}
      />

      <GenericCard styles={styles} className={styles.applicationsCard}>
        <Table
          columns={columns}
          data={rows}
          paginationModel={{
            page: data.pageNumber - 1,
            pageSize: data.pageSize,
          }}
          totalRows={data.total}
          onPaginationChange={setPaginationModel}
          styles={styles}
        />
      </GenericCard>
    </div>
  );
}
