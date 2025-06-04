// components/FacetFilters.tsx
import React, { useState, useEffect } from 'react';
import { Facets } from '@/lib/api';
import styles from './FacetFilters.module.css'; // Import the CSS module

export type ActiveFilters = {
  [K in keyof Facets]?: string[];
};

export interface FacetFiltersProps {
  facets: Facets;
  onFilterChange: (activeFilters: ActiveFilters) => void;
}

const FacetFilters: React.FC<FacetFiltersProps> = ({ facets, onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  useEffect(() => {
    onFilterChange(activeFilters);
  }, [activeFilters, onFilterChange]);

  const handleCheckboxChange = (facetKey: keyof Facets, value: string) => {
    setActiveFilters(prevFilters => {
      const currentSelection = prevFilters[facetKey] || [];
      const newSelection = currentSelection.includes(value)
        ? currentSelection.filter(item => item !== value)
        : [...currentSelection, value];

      if (newSelection.length === 0) {
        const { [facetKey]: _, ...rest } = prevFilters;
        return rest;
      }
      return { ...prevFilters, [facetKey]: newSelection };
    });
  };

  const isChecked = (facetKey: keyof Facets, value: string): boolean => {
    return activeFilters[facetKey]?.includes(value) || false;
  };

  return (
    <div className={styles.facetFiltersContainer}> {/* Apply style */}
      <h4>Filter By:</h4>
      {Object.keys(facets).map(key => {
        const facetKey = key as keyof Facets;
        const facetValues = facets[facetKey];
        if (!facetValues || facetValues.length === 0) return null;

        return (
          <div key={facetKey} className={styles.facetGroup}> {/* Apply style */}
            <h5>{facetKey.charAt(0).toUpperCase() + facetKey.slice(1)}</h5>
            <ul className={styles.filterList}> {/* Apply style */}
              {facetValues.map(value => (
                <li key={value} className={styles.filterItem}> {/* Apply style */}
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked(facetKey, value)}
                      onChange={() => handleCheckboxChange(facetKey, value)}
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
