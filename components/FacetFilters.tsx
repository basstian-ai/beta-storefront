// components/FacetFilters.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Facets } from '@/lib/api';
import styles from './FacetFilters.module.css';

export type ActiveFilters = {
  [K in keyof Facets]?: string[];
};

export interface FacetFiltersProps {
  facets: Facets;
  onFilterChange: (activeFilters: ActiveFilters) => void;
  initialActiveFilters?: ActiveFilters; // New prop to set initial/controlled state
}

const FacetFilters: React.FC<FacetFiltersProps> = ({ facets, onFilterChange, initialActiveFilters }) => {
  const [internalActiveFilters, setInternalActiveFilters] = useState<ActiveFilters>(initialActiveFilters || {});

  // Effect to update internal state if initialActiveFilters prop changes from parent
  // This makes the component's displayed filters react to URL changes reflected in parent state.
  useEffect(() => {
    setInternalActiveFilters(initialActiveFilters || {});
  }, [initialActiveFilters]);

  // Debounce or throttle onFilterChange if it causes too many updates,
  // but for now, direct call is fine.
  const handleFilterChangeInternal = useCallback((facetKey: keyof Facets, value: string) => {
    // Create a new object to ensure state update and to pass to parent
    const newFilters = { ...internalActiveFilters };
    const currentSelection = newFilters[facetKey] || [];

    const valueIndex = currentSelection.indexOf(value);
    if (valueIndex > -1) { // Value is currently selected, so deselect
      newFilters[facetKey] = currentSelection.filter(item => item !== value);
      if (newFilters[facetKey]?.length === 0) {
        delete newFilters[facetKey]; // Remove key if selection is empty
      }
    } else { // Value is not selected, so select
      newFilters[facetKey] = [...currentSelection, value];
    }

    setInternalActiveFilters(newFilters); // Update internal state first
    onFilterChange(newFilters); // Then notify parent
  }, [internalActiveFilters, onFilterChange]);


  const isChecked = (facetKey: keyof Facets, value: string): boolean => {
    return internalActiveFilters[facetKey]?.includes(value) || false;
  };

  return (
    <div className={styles.facetFiltersContainer}>
      <h4>Filter By:</h4>
      {Object.keys(facets).map(key => {
        const facetKey = key as keyof Facets;
        const facetValues = facets[facetKey];
        if (!facetValues || facetValues.length === 0) return null;

        return (
          <div key={facetKey} className={styles.facetGroup}>
            <h5>{facetKey.charAt(0).toUpperCase() + facetKey.slice(1)}</h5>
            <ul className={styles.filterList}>
              {facetValues.map(value => (
                <li key={value} className={styles.filterItem}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked(facetKey, value)}
                      onChange={() => handleFilterChangeInternal(facetKey, value)}
                    />
                    {value}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default FacetFilters;
