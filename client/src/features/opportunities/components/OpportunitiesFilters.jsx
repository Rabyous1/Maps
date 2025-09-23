'use client';
import React, { useState } from 'react';
import GenericSearch from '@/components/GenericSearch';
import Select from '@/components/ui/inputs/Select';
import GenericButton from '@/components/ui/inputs/Button';
import { Grid2 } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  industryOptions,
  countryOptions,
  ContractTypes,
  EmploymentTypes,
  visibilityOptions,
  WorkModes,
  jobStatusOptions,
  urgentOpportunities,
  isArchivedOpportunities,
} from '@/utils/constants';

export default function OpportunitiesFilters({
  filters,
  onChange,
  onClear,
  styles,
}) {
  const [localTitle, setLocalTitle] = useState(filters.title);
  const [localStatus, setLocalStatus] = useState(filters.status);

  const handleSearch = () => {
    onChange({
      ...filters,
      title: localTitle,
      status: localStatus,
    });
  };

  const handleImmediate = (field) => (value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleClear = () => {
    setLocalTitle('');
    setLocalStatus('');
    onClear();
  };

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.searchRow}>
        <GenericSearch
          value={localTitle}
          onChange={setLocalTitle}
          placeholder="Job title, keywords"
          styles={{
            searchWrapper: styles.searchInputWrapper,
            input: styles.searchInput,
          }}
        />

        <div className={styles.selectWrapper}>
          <Select
            name="status"
            value={localStatus}
            options={jobStatusOptions}
            onChange={(e) => setLocalStatus(e.target.value)}
            placeholder="Status"
            styles={styles}
          />
        </div>

        {/* actionButtons wrapper */}
        <div className={styles.actionButtons}>
          <GenericButton
            startIcon={<RefreshIcon className={styles.refreshIcon} />}
            className={styles.clearSearchButton}
            onClick={handleClear}
            variant="outlined"
          >
            Clear
          </GenericButton>

          <GenericButton
            className={styles.searchButton}
            onClick={handleSearch}
          >
            Search
          </GenericButton>
        </div>
      </div>

      <Grid2 container spacing={2} className={styles.filterGrid}>
        {[
          { key: 'industry', opts: industryOptions, placeholder: "Inductry" },
          { key: 'country', opts: countryOptions, placeholder: "Country" },
          { key: 'contractType', opts: ContractTypes , placeholder: "Contract Type" },
          { key: 'employmentType', opts: EmploymentTypes, placeholder: "Employment Type" },
          { key: 'visibility', opts: visibilityOptions, placeholder: "Visibility" },
          { key: 'workMode', opts: WorkModes , placeholder: "Work Mode"},
          { key: 'urgent', opts: urgentOpportunities, placeholder: "Urgency" },
          { key: 'isArchived', opts: isArchivedOpportunities, placeholder: "Archived" },
        ].map(({ key, opts, placeholder }) => (
          <Grid2 key={key} className={`${styles.filterSelectWrapper} ${filters[key] ? styles.activeSelect : ''}`} >

            <Select
              name={key}
              value={filters[key]}
              options={opts}
              onChange={(e) => handleImmediate(key)(e.target.value)}
              clearable
              onClear={() => onChange({ ...filters, [key]: '' })}
              placeholder={placeholder}
              styles={styles}
            />
          </Grid2>
        ))}
      </Grid2>
    </div>
  );
}
