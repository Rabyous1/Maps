'use client';
import React, { useState } from 'react';
import GenericSearch from '@/components/GenericSearch';
import Select from '@/components/ui/inputs/Select';
import GenericButton from '@/components/ui/inputs/Button';
import DateRangePicker from '@/components/ui/inputs/DateRangePicker';
import RefreshIcon from '@mui/icons-material/Refresh';
import { applicationStatisOptions, jobStatusOptions } from '@/utils/constants';

export default function ApplicationsFilters({
  filters = {},
  onChange,
  onClear,
  styles,
}) {
  const [localTitle, setLocalTitle] = useState(filters.searchTitle || '');
  const [localStatus, setLocalStatus] = useState(filters.status || '');
  const [localNote, setLocalNote] = useState(filters.searchNote || '');
  const [localDateRange, setLocalDateRange] = useState(filters.applicationDate || null);

  const handleSearch = () => {
    onChange({
      ...filters,
      searchTitle: localTitle,
      status: localStatus,
      searchNote: localNote,
      applicationDate: localDateRange,
    });
  };

  const handleClear = () => {
    setLocalTitle('');
    setLocalStatus('');
    setLocalNote('');
    setLocalDateRange(null);
    onClear();
  };

  return (
    <div className={styles.filtersWrapper}>
      <GenericSearch
        value={localTitle}
        onChange={setLocalTitle}
        placeholder="Job title"
        styles={{
          searchWrapper: styles.searchInputWrapper,
          input: styles.searchInput,
        }}
      />

      <GenericSearch
        value={localNote}
        onChange={setLocalNote}
        placeholder="Note"
        styles={{
          searchWrapper: styles.searchInputWrapper,
          input: styles.searchInput,
        }}
      />

      <Select
        name="status"
        value={localStatus}
        options={applicationStatisOptions}
        onChange={(e) => setLocalStatus(e.target.value)}
        placeholder="Status"
        styles={styles}
      />
      <DateRangePicker
        value={localDateRange}
        onChange={setLocalDateRange}
        className={styles.dateRangeWrapper}
        placeholder='Date'
        styles={styles}
      />

      <div className={styles.actionButtons}>
        <GenericButton
          startIcon={<RefreshIcon className={styles.refreshIcon} />}
          className={styles.clearSearchButton}
          onClick={handleClear}
          variant="outlined"
        >
          Clear
        </GenericButton>

        <GenericButton className={styles.searchButton} onClick={handleSearch}>
          Search
        </GenericButton>
      </div>
    </div>

  );
}
