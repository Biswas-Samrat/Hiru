/**
 * FilterBar component
 * Renders a horizontal list of category buttons.
 * The selected category is highlighted.
 * Calls onSelect with the chosen category.
 */
const FilterBar = ({ categories = [], selected = '', onSelect = () => {} }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 border-b border-[#e8e6e1] pb-6">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
            cat === selected
              ? 'border-b-2 border-brand-orange text-ink'
              : 'text-muted hover:text-ink'
          }`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
