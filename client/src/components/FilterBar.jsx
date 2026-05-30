/**
 * FilterBar component
 * Renders a horizontal list of category buttons.
 * The selected category is highlighted.
 * Calls onSelect with the chosen category.
 */
const FilterBar = ({ categories = [], selected = '', onSelect = () => {} }) => {
  return (
    <div className="my-4 flex justify-center gap-2 overflow-x-auto py-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`whitespace-nowrap rounded-full border px-4 py-3 transition-colors ${
            cat === selected
              ? 'border-gold bg-gold font-extrabold text-[#0b0b0b]'
              : 'border-gold/35 bg-gray-50 text-gray-900 hover:border-gold/60'
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
