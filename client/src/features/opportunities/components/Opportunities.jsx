'use client'

import React, { useState } from 'react';
import { Box } from '@mui/material';
import OpportunitiesFilters from './OpportunitiesFilters';
import OpportunitiesTable from './OpportunitiesTable';

const initialFilters = {
  title: '',
  status: '',
  industry: '',
  country: '',
  contractType: '',
  employmentType: '',
  visibility: '',
  workMode: '',
  urgent: false,
  isArchived: false,
};

export default function Opportunities({ styles }) {
  const [filters, setFilters] = useState(initialFilters);
  const [total, setTotal] = useState(0);

  return (
    <Box className={styles.opportunitieswrapper}>
      <p className={styles.opportunitiesTitle}>Opportunities List
        {/* <span className={styles.opportunitiesTotal}> ({total} total)</span> */}
        </p>
      <div className={styles.opportunitiesContent}>
      <OpportunitiesFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(initialFilters)}
        styles={styles}
      />
      <OpportunitiesTable filters={filters} setTotal={setTotal} styles={styles} />
      </div>
    </Box>
  );
}
