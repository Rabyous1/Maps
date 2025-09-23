'use client';

import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  Collapse,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/KeyboardArrowDown';
import ToggleDrawerIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import ExpandDrawerIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import styles from '@/assets/styles/layout/FilterSidebar.module.scss';
import { ContractTypes } from '@/utils/constants';

export default function FilterSidebar({ open, setOpen }) {
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);

  const [industryOpen, setIndustryOpen] = useState(true);
  const [contractOpen, setContractOpen] = useState(true);

  const toggleDrawer = () => setOpen(!open);

  const toggleIndustry = (label) => {
    setSelectedIndustries((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const toggleContract = (label) => {
    setSelectedContractTypes((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleClear = () => {
    setSelectedIndustries([]);
    setSelectedContractTypes([]);
  };

  const handleSearch = () => {
    const filters = {
      industry: selectedIndustries[0] || null,
      contractType: selectedContractTypes[0] || null,
    };
    console.log('Search with filters:', filters);
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      className={`${styles.drawer} ${!open ? styles.collapsed : ''}`}
      classes={{ paper: `${styles.paper} ${!open ? styles.collapsed : ''}` }}
    >
      <div className={styles.header}>
        {open && <h3 className={styles.title}>Filter</h3>}
        <IconButton onClick={toggleDrawer} className={styles.toggleBtn}>
          {open ? <ToggleDrawerIcon /> : <ExpandDrawerIcon />}
        </IconButton>
      </div>

      <div className={styles.content}>
        {open && (
          <>
            <input className={styles.searchInput} placeholder="Search" />

            {/* INDUSTRY SECTION */}
            <div className={styles.section}>
              <div
                className={`${styles.sectionHeader} ${!industryOpen ? styles.collapsed : ''}`}
                onClick={() => setIndustryOpen(!industryOpen)}
              >
                <span>Industry</span>
                {industryOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </div>
              <Collapse in={industryOpen}>
                <div className={styles.checkboxGroup}>
                  {['Banking', 'Energies', 'IT & Telecom', 'Transport', 'Pharmaceutical', 'Other'].map((item) => (
                    <FormControlLabel
                      key={item}
                      control={
                        <Checkbox
                          checked={selectedIndustries.includes(item)}
                          onChange={() => toggleIndustry(item)}
                          className={styles.checkbox}
                        />
                      }
                      label={item}
                      classes={{ label: styles.checkboxLabel }}
                    />
                  ))}
                </div>
              </Collapse>
            </div>

            {/* CONTRACT TYPE SECTION */}
            <div className={styles.section}>
              <div
                className={`${styles.sectionHeader} ${!contractOpen ? styles.collapsed : ''}`}
                onClick={() => setContractOpen(!contractOpen)}
              >
                <span>Contract Type</span>
                {contractOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </div>
              <Collapse in={contractOpen}>
                <div className={styles.checkboxGroup}>
                  {ContractTypes.map((item) => (
                    <FormControlLabel
                      key={item}
                      control={
                        <Checkbox
                          checked={selectedContractTypes.includes(item)}
                          onChange={() => toggleContract(item)}
                          className={styles.checkbox}
                        />
                      }
                      label={item}
                      classes={{ label: styles.checkboxLabel }}
                    />
                  ))}
                </div>
              </Collapse>
            </div>

            {/* BUTTONS
            <div className={styles.buttonGroup}>
              <button className={styles.clearBtn} onClick={handleClear}>
                Clear
              </button>
              <button className={styles.searchBtn} onClick={handleSearch}>
                Search
              </button>
            </div> */}
          </>
        )}
      </div>
    </Drawer>
  );
}