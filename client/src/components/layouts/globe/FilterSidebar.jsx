'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Collapse, FormControlLabel } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/KeyboardArrowDown';

import { useTheme } from '@/features/globe3D/hooks/useTheme';
import ThemeArrowIcon from '@/features/globe3D/components/FilterMenu/ThemeArrowIcon';
import GenericCheckbox from '@/components/ui/inputs/GenericCheckbox';

import styles from '@/assets/styles/layout/FilterSidebar.module.scss';
import { ContractTypes } from '@/utils/constants';

export default function FilterSidebar({ open, setOpen, onFilter, onClear }) {
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);
  const [title, setTitle] = useState('');
  const [industryOpen, setIndustryOpen] = useState(true);
  const [contractOpen, setContractOpen] = useState(true);
  const [hasTypedOnce, setHasTypedOnce] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isClearingRef = useRef(false);

  const theme = useTheme();

  const toggleDrawer = () => setOpen(!open);

  const handleSearch = () => {
    const isEmpty =
      selectedIndustries.length === 0 &&
      selectedContractTypes.length === 0 &&
      title.trim() === '';

    if (isEmpty) return;

    const filters = {
      industry: selectedIndustries,
      contractType: selectedContractTypes,
      title,
    };

    if (typeof onFilter === 'function') {
      onFilter(filters);
    }
  };

  const handleClear = () => {
    setSelectedIndustries([]);
    setSelectedContractTypes([]);
    setTitle('');
    if (typeof onClear === 'function') {
      onClear();
    }
  };

  const toggleIndustry = (label) => {
    setHasTypedOnce(true);
    setSelectedIndustries((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // const toggleContract = (label) => {
  //   setHasTypedOnce(true);
  //   setSelectedContractTypes((prev) =>
  //     prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
  //   );
  // };
const toggleContract = (value) => {
  setSelectedContractTypes((prev) =>
    prev.includes(value)
      ? prev.filter((item) => item !== value)
      : [...prev, value]
  );
};

  useEffect(() => {
    if (!hasTypedOnce || isClearingRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const filters = {
        industry: selectedIndustries,
        contractType: selectedContractTypes,
        title,
      };

      if (typeof onFilter === 'function') {
        onFilter(filters);
      }
    }, 500);

    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, [title]);

  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}
      aria-label="Filter Sidebar"
    >
      <header className={styles.header}>
        {open ? (
          <>
            <h3 className={styles.title}>Filter</h3>
            <button
              onClick={toggleDrawer}
              className={styles.toggleBtn}
              aria-label="Close filter sidebar"
            >
              <ThemeArrowIcon direction="left" />
            </button>
          </>
        ) : (
          <div
            onClick={toggleDrawer}
            className={styles.showFilterButton}
            title="Show filter"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleDrawer();
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.verticalButton}>
              <div className={styles.iconWrapper}>
                <ThemeArrowIcon direction="right" />
              </div>
              <span className={styles.verticalText}>Show filter</span>
            </div>
          </div>
        )}
      </header>

      {open && (
        <div className={styles.content}>
          <input
            className={styles.searchInput}
            placeholder="Search"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setHasTypedOnce(true);
              setTitle(value);

              if (value.trim() === '') {
                isClearingRef.current = true;
                handleClear();
                setTimeout(() => {
                  isClearingRef.current = false;
                }, 600); // évite le debounce après clear
              }
            }}
          />

          <section className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => setIndustryOpen(!industryOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIndustryOpen(!industryOpen);
              }}
              style={{ cursor: 'pointer' }}
            >
              <span>Industry</span>
              {industryOpen ? (
                <ExpandLessIcon sx={{ fontSize: '1.5rem' }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: '1.5rem' }} />
              )}
            </div>

            <Collapse in={industryOpen}>
              <div className={styles.checkboxGroup}>
                {[
                  'Banking',
                  'Energies',
                  'IT & Telecom',
                  'Transport',
                  'Pharmaceutical',
                  'Other',
                ].map((item) => (
                  <GenericCheckbox
                    key={item}
                    name={`industry-${item}`}
                    label={item}
                    checked={selectedIndustries.includes(item)}
                    onChange={() => toggleIndustry(item)}
                    styles={styles}
                  />
                ))}
              </div>
            </Collapse>
          </section>

          <section className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => setContractOpen(!contractOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setContractOpen(!contractOpen);
              }}
              style={{ cursor: 'pointer' }}
            >
              <span>Contract Type</span>
              {contractOpen ? (
                <ExpandLessIcon sx={{ fontSize: '1.5rem' }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: '1.5rem' }} />
              )}
            </div>

            <Collapse in={contractOpen}>
              <div className={styles.checkboxGroup}>
                {/* {['CDD', 'CDI', 'Freelance'].map((item) => (
                  <GenericCheckbox
                    key={item}
                    name={`contract-${item}`}
                    label={item}
                    checked={selectedContractTypes.includes(item)}
                    onChange={() => toggleContract(item)}
                    styles={styles}
                  />
                ))} */}
                {ContractTypes.map((item) => (
                  <FormControlLabel
                    key={item.value}
                    control={
                      <GenericCheckbox
                        checked={selectedContractTypes.includes(item.value)}
                        onChange={() => toggleContract(item.value)}
                        styles={styles}

                      />
                    }
                    label={item.label}
                    classes={{ label: styles.checkboxLabel }}
                  />
                ))}

              </div>
            </Collapse>
          </section>

          <div className={styles.buttonGroup}>
            <button
              className={styles.clearBtn}
              onClick={handleClear}
              style={{ cursor: 'pointer' }}
            >
              Clear
            </button>

            <button
              className={styles.searchBtn}
              onClick={() => {
                setHasTypedOnce(true);
                handleSearch();
              }}
              style={{ cursor: 'pointer' }}
            >
              Search
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
