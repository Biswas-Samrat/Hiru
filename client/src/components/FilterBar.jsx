import React from 'react';
import './FilterBar.css';

/**
 * FilterBar component
 * Renders a horizontal list of category buttons.
 * The selected category is highlighted.
 * Calls onSelect with the chosen category.
 */
const FilterBar = ({ categories = [], selected = '', onSelect = () => {} }) => {
  return (
    <div className="filter-bar">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={cat === selected ? 'active' : ''}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
