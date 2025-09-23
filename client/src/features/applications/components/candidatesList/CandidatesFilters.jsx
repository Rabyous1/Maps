'use client';

import React from 'react';
import Select from '@/components/ui/inputs/Select';
import GenericCheckbox from '@/components/ui/inputs/GenericCheckbox';
import GenericSearch from '@/components/GenericSearch';
import { interestStatusOptions } from '@/utils/constants';

export default function CandidatesFilters({ styles, filters, onFilterChange }) {
  return (
    <div className={styles.filtersWrapper}>
      <GenericSearch
          value={filters.search}
          onChange={val => onFilterChange('search', val)}
          placeholder="Search candidate..."
          styles={styles}
        />
      <Select
        name="interest"
        value={filters.interest}
        options={interestStatusOptions

        }
        onChange={e => onFilterChange('interest', e.target.value)}
        clearable
        onClear={() => onFilterChange('interest', '')}
        placeholder="All interests"
        styles={styles}
      />
      <GenericCheckbox
        name="hasCvVideo"
        label="Has CV Video"
        checked={filters.hasCvVideo === true}
        onChange={e => onFilterChange('hasCvVideo', e.target.checked ? true : undefined)}
        styles={styles}
      />
    </div>
  );
}
