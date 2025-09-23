'use client';

import React from 'react';
import { Box, FormControlLabel, Checkbox } from '@mui/material';
import GenericSearch from '@/components/GenericSearch';
import GenericButton from '@/components/ui/inputs/Button';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import DateRangePicker from '@/components/ui/inputs/DateRangePicker';
import Select from '@/components/ui/inputs/Select';
import { applicationStatisOptions, industryOptions, jobStatusOptions } from '@/utils/constants';

export default function ApplicationsFilters({
  styles,
  filters,
  onFilterChange,
  onSearch
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleClear = () => {
    onFilterChange('jobTitleFilter', '');
    onFilterChange('locationFilter', '');
    onFilterChange('statusFilter', '');
    onFilterChange('industryFilter', '');
    onFilterChange('applicationDateRange', { startDate: null, endDate: null });
    onFilterChange('hasCvVideo', undefined);
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} className={styles.filtersWrapper}>
      <Box className={styles.searchRow}>
        <GenericSearch
          value={filters.jobTitleFilter}
          onChange={(v) => onFilterChange('jobTitleFilter', v)}
          placeholder="Job title, keywords"
          styles={{
            searchWrapper: styles.searchInputWrapper,
            input: styles.searchInput,
          }}
        />
        <GenericSearch
          value={filters.locationFilter}
          onChange={(v) => onFilterChange('locationFilter', v)}
          placeholder="Location (city or country)"
          icon={LocationOnIcon}
          styles={{
            searchWrapper: styles.searchInputWrapper,
            input: styles.searchInput,
          }}
        />

        <Box className={styles.actionButtons}>
          <GenericButton
            type="button"
            startIcon={<RefreshIcon className={styles.refreshIcon} />}
            className={styles.clearSearchButton}
            onClick={handleClear}
            variant="outlined"
          >
            Clear
          </GenericButton>

          <GenericButton type="submit" className={styles.searchButton}>
            Search
          </GenericButton>
        </Box>
      </Box>

      <Box className={styles.selectfiltersRow}>
          <Select
            name="status"
            placeholder="Status"
            value={filters.statusFilter}
            options={jobStatusOptions}
            onChange={(e) => onFilterChange('statusFilter', e.target.value)}
            clearable
            onClear={() => onFilterChange('statusFilter', '')}
            styles={styles}
          />

          <Select
            name="industry"
            placeholder="Industry"
            value={filters.industryFilter}
            options={industryOptions}
            onChange={(e) => onFilterChange('industryFilter', e.target.value)}
            clearable
            onClear={() => onFilterChange('industryFilter', '')}
            styles={styles}
          />

          <DateRangePicker
            value={filters.applicationDateRange}
            onChange={(value) => onFilterChange('applicationDateRange', value)}
            className={styles.dateRangeWrapper}
            placeholder="Date"
            styles={styles}
          />

        <FormControlLabel
         className={styles.checkboxWrapper}
          control={
            <Checkbox
            className={styles.checkbox}
              checked={filters.hasCvVideo === true}
              onChange={(e) =>
                onFilterChange('hasCvVideo', e.target.checked ? true : undefined)
              }
            />
          }
           label={<span className={styles.checkboxLabel}>Has CV Video</span>}
        />
      </Box>
    </Box>
  );
}
