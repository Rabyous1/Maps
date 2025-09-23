'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './GlobePin.module.scss';
import FilterSidebar from '@/components/layouts/globe/FilterSidebar';
import CityCard from '../CityCard/CityCard';
import { useGlobeLogic } from '../../hooks/useGlobeLogic';
import GlobeLoader from './GlobeLoader';

export default function GlobePin() {
  const {
    globeRef,
    pins,
    filtersApplied,
    setFilterOpen,
    handleFilter,
    handleClear,
    handleCity,
    isGlobeLoading,
  } = useGlobeLogic();

  const [isDelayedLoading, setIsDelayedLoading] = useState(true);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isGlobeLoading) {
      const timer = setTimeout(() => {
        setIsDelayedLoading(false);
      }, 500); 

      return () => clearTimeout(timer);
    } else {
      setIsDelayedLoading(true);
    }
  }, [isGlobeLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideThemeToggle = event.target.closest('.theme-toggle');

      if (
        containerRef.current &&
        globeRef.current &&
        !globeRef.current.contains(event.target) &&
        (!cardRef.current || !cardRef.current.contains(event.target)) &&
        !clickedInsideThemeToggle // ⛔ Ignore si clic sur ThemeToggle
      ) {
        handleClear();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [globeRef, handleClear]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        ref={globeRef}
        className={`${styles.globeWrapper} ${isDelayedLoading ? styles.hidden : styles.visible}`}
      />

      {isDelayedLoading && (
        <div className={styles.loaderOverlay}>
          <GlobeLoader />
        </div>
      )}

      <FilterSidebar
        open={setFilterOpen[0]}
        setOpen={setFilterOpen[1]}
        onFilter={handleFilter}
        onClear={handleClear}
      />

      {filtersApplied && (
        <div ref={cardRef}>
          <CityCard pins={pins} onSelect={handleCity} />
        </div>
      )}
    </div>
  );
}
