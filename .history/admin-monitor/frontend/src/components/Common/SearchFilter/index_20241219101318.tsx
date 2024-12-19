import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface SearchFilterProps {
  onSearch: (value: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  filters?: {
    name: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  filters = [],
  placeholder = '搜索...'
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [name]: value
    };
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  };

  return (
    <div className="search-filter-container">
      <div className="search-input-wrapper">
        <motion.input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileFocus={{ scale: 1.02 }}
        />
        <i className="fas fa-search search-icon"></i>
        {filters.length > 0 && (
          <motion.button
            className="filter-toggle"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-filter"></i>
          </motion.button>
        )}
      </div>

      {isFiltersVisible && filters.length > 0 && (
        <motion.div
          className="filters-container"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {filters.map((filter) => (
            <div key={filter.name} className="filter-item">
              <label>{filter.label}</label>
              <select
                value={activeFilters[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              >
                <option value="">全部</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SearchFilter; 