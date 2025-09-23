'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGlobeTheme } from './useGlobeTheme';
import { flyToLocation, resetChart, reapplyPins } from '../services/globeActions';
import { useFavoriteOpportunities } from '@/features/opportunities/hooks/opportunities.hooks';

export function useGlobeLogic() {
  const globeRef = useRef(null);
  const initialScaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [pins, setPins] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [isGlobeLoading, setIsGlobeLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);

  const handleOutsideCountryClick = useCallback(() => {
    handleClear(); // clic hors globe = reset
  }, []);

  const {
    chart,
    highlightRegion,
    createLabel,
    clearLabels,
    setOnCountryClickHandler,
  } = useGlobeTheme(globeRef, setIsGlobeLoading);
//   const { data: favoriteOps = [] } = useFavoriteOpportunities();

// const favoriteIds = new Set(favoriteOps.map(fav => fav.id));

// const mergeFavorites = (pins) =>
//   pins.map(pin => ({ ...pin, isFavorite: favoriteIds.has(pin.id) }));


  const fetchPins = useCallback(async (filters = {}) => {
    try {
      const query = new URLSearchParams();

      if (filters.industry?.length > 0) {
        filters.industry.forEach((i) => query.append('industry', i));
      }
      if (filters.contractType?.length > 0) {
        filters.contractType.forEach((ct) => query.append('contractType', ct));
      }
      if (filters.title?.trim()) {
        query.append('title', filters.title.trim());
      }
      if (filters.country?.trim()) {
        query.append('country', filters.country.trim());
      }

      const url = `http://localhost:4000/api/v1/opportunities/pins?${query.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!Array.isArray(data)) return;

      const validPins = data.filter(
        (pin) =>
          pin.location &&
          typeof pin.location.lat === 'number' &&
          typeof pin.location.lon === 'number' &&
          pin.label &&
          pin.country &&
          pin.reference
      );

      setPins(validPins);
      // setPins(mergeFavorites(validPins));

    } catch (err) {
      console.error('Failed to fetch pins:', err);
    }
  }, []);

  const handleFilter = useCallback((filters) => {
    fetchPins(filters);
    setFiltersApplied(true);
  }, [fetchPins]);

  const handleClear = useCallback(() => {
    resetChart(chart, initialScaleRef, clearLabels, highlightRegion, setSelectedCountry);
    setPins([]);
    setFiltersApplied(false);
  }, [chart, clearLabels, highlightRegion]);

  const handleCity = useCallback((pin) => {
    if (
      !pin ||
      !pin.location ||
      typeof pin.location.lat !== 'number' ||
      typeof pin.location.lon !== 'number' ||
      !pin.label ||
      !pin.country ||
      !pin.reference
    ) {
      console.warn('❌ Pin invalide ou incomplet :', pin);
      return;
    }

    flyToLocation({
      chart,
      initialScaleRef,
      label: pin.label,
      loc: pin.location,
      country: pin.country,
      reference: pin.reference,
      clearLabels,
      highlightRegion,
      createLabel,
      setSelectedCountry,
    });
  }, [chart, clearLabels, highlightRegion]);

  const handleCountryClick = useCallback((countryCode) => {
    if (countryCode) {
      fetchPins({ country: countryCode });
      setFiltersApplied(true);
      setSelectedCountry(countryCode);
    }
  }, [fetchPins]);

  useEffect(() => {
    if (chart) {
      reapplyPins(chart);
    }
  }, [chart]);

  useEffect(() => {
    setOnCountryClickHandler(handleCountryClick);
  }, [setOnCountryClickHandler, handleCountryClick]);

  return {
    globeRef,
    initialScaleRef,
    chart,
    pins,
    selectedCountry,
    filtersApplied,
    setFilterOpen: [filterOpen, setFilterOpen],
    handleFilter,
    handleClear,
    handleCity,
    isGlobeLoading,
  };
}
export default useGlobeLogic;