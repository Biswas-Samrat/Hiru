import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  curryBases,
  customerMenu,
  formatCurrency,
  spiceLevels,
} from '../data/menuData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CART_KEY = 'hirans-cart';

const inputLight =
  'w-full min-h-12 rounded-lg border border-gray-200 bg-gray-50 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gold focus:outline-none';

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('hirans-cart-updated'));
};

const displayCategory = (category = '') => {
  if (category.includes('Kottu')) return 'Kottu';
  if (category.includes('Rice') || category === 'Lunch') return 'Rice';
  if (category === 'Burgers') return 'Burgers';
  return 'Fusion';
};

const normaliseApiItem = (item) => ({
  ...item,
  id: item.id || item._id,
  price: Number(item.price),
  dietary: [item.isVegetarian ? 'V' : null].filter(Boolean),
  isSpicy: Boolean(item.isSpicy || Number(item.spicyLevel) > 0),
  displayCategory: displayCategory(item.category),
  customization: displayCategory(item.category) === 'Kottu'
    ? { curryBase: true, spice: true, extras: true }
    : { spice: Boolean(item.isSpicy || Number(item.spicyLevel) > 0), extras: displayCategory(item.category) === 'Burgers' },
});

const OrderOnlinePage = () => {
  const [menuItems, setMenuItems] = useState(customerMenu.map((item) => ({ ...item, displayCategory: displayCategory(item.category) })));
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState(getCart);
  const [options, setOptions] = useState({
    quantity: 1,
    curryBase: curryBases[0],
    spiceLevel: 'Medium',
    addCheese: false,
    addEgg: false,
    combo: false,
  });

  useEffect(() => {
    let active = true;

    axios.get(`${API_URL}/api/menu`).then((menuResult) => {
      if (!active) return;
      if (Array.isArray(menuResult.data) && menuResult.data.length) {
        setMenuItems(
          menuResult.data
            .filter((item) => item.isAvailable !== false && item.isOutOfStock !== true)
            .map(normaliseApiItem)
        );
      }
    }).catch(() => {});

    const syncCart = () => setCart(getCart());
    window.addEventListener('hirans-cart-updated', syncCart);
    window.addEventListener('storage', syncCart);

    return () => {
      active = false;
      window.removeEventListener('hirans-cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (filterCategory === 'All') return menuItems;
    return menuItems.filter((item) => item.displayCategory === filterCategory);
  }, [filterCategory, menuItems]);

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);

  const openOptions = (item) => {
    setSelectedItem(item);
    setOptions({
      quantity: 1,
      curryBase: curryBases[0],
      spiceLevel: item.isSpicy ? 'Medium' : 'Mild',
      addCheese: false,
      addEgg: false,
      combo: false,
    });
  };

  const addToCart = (item = selectedItem) => {
    if (!item) return;

    const extras = [
      options.addCheese ? { name: 'Add Cheese', price: 5 } : null,
      options.addEgg ? { name: 'Add Egg', price: 3 } : null,
      options.combo ? { name: 'Fries & Drink Combo', price: 7 } : null,
    ].filter(Boolean);
    const quantity = selectedItem ? options.quantity : 1;
    const unitPrice = Number(item.price) + extras.reduce((sum, extra) => sum + extra.price, 0);
    const cartIdParts = [
      item.id,
      getCart().length,
      quantity,
      unitPrice,
      options.curryBase,
      options.spiceLevel,
      extras.map((extra) => extra.name).join('-'),
    ];
    const cartItem = {
      cartId: cartIdParts.filter(Boolean).join('-'),
      menuItem: item.id,
      itemName: item.name,
      quantity,
      price: Number(item.price),
      unitPrice,
      lineTotal: unitPrice * quantity,
      prepTime: item.prepTime || 15,
      category: item.category,
      curryBase: selectedItem && item.customization?.curryBase ? options.curryBase : null,
      spiceLevel: selectedItem && item.customization?.spice ? options.spiceLevel : null,
      extras,
    };

    const nextCart = [...getCart(), cartItem];
    saveCart(nextCart);
    setCart(nextCart);
    setSelectedItem(null);
    toast.success(`${item.name} added to cart`);
  };

  const handleAddClick = (item) => {
    if (item.customization?.curryBase || item.customization?.spice || item.customization?.extras) {
      openOptions(item);
    } else {
      addToCart(item);
    }
  };

  const placeholderImage =
    'https://images.unsplash.com/photo-1585937421612-70a008296fbe?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="min-h-screen bg-[#f5f4f0] pb-20 pt-28 text-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mb-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-ink md:text-5xl">Order online</h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              Pick your favourites, add to cart, and collect from Taupo. Takeaway only.
            </p>
          </div>
          <Link
            to="/cart"
            className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[#e8e6e1] bg-white px-5 py-2.5 text-sm shadow-sm transition hover:border-gold/40"
          >
            <i className="fa-solid fa-cart-shopping text-brand-orange" />
            <span className="font-semibold">{cart.length} items</span>
            <b className="font-bold text-ink">{formatCurrency(cartTotal)}</b>
          </Link>
        </div>

        <FilterBar
          categories={['All', ...new Set(menuItems.map((i) => i.displayCategory))]}
          selected={filterCategory}
          onSelect={setFilterCategory}
        />

        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2 md:gap-x-16 lg:gap-x-20">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group flex gap-4 border-b border-[#e8e6e1]/80 py-6 last:border-b-0 md:py-7"
            >
              <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-[#ebe9e4] sm:h-24 sm:w-24">
                <img
                  src={item.image || placeholderImage}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center pr-2">
                <h2 className="font-serif text-xl font-bold leading-tight text-ink sm:text-2xl">
                  {item.code ? `${item.code}. ` : ''}
                  {item.name}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end justify-center gap-3">
                <span className="font-serif text-lg font-bold tabular-nums text-ink sm:text-xl">
                  {formatCurrency(item.price)}
                </span>
                <button
                  type="button"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-brand-orange text-ink shadow-md transition hover:scale-105 hover:bg-[#e85f2a] active:scale-95"
                  onClick={() => handleAddClick(item)}
                  title="Add to cart"
                  aria-label={`Add ${item.name} to cart`}
                >
                  <i className="fa-solid fa-bag-shopping text-base" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {visibleItems.length === 0 && (
          <div className="mt-12 py-16 text-center text-muted">
            No available items in this category right now.
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close"
              onClick={() => setSelectedItem(null)}
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <img src={selectedItem.image} alt={selectedItem.name} className="mb-4 h-40 w-full rounded-lg object-cover" />
            <h2 className="mb-2 text-xl font-bold text-gray-900">{selectedItem.name}</h2>
            <p className="mb-4 text-sm text-gray-600">{selectedItem.description}</p>

            {selectedItem.customization?.curryBase && (
              <label className="mb-4 block text-sm font-semibold text-gray-700">
                Choose Your Curry Base
                <select
                  className={`${inputLight} mt-1`}
                  value={options.curryBase}
                  onChange={(e) => setOptions({ ...options, curryBase: e.target.value })}
                >
                  {curryBases.map((base) => <option key={base}>{base}</option>)}
                </select>
              </label>
            )}

            {selectedItem.customization?.spice && (
              <label className="mb-4 block text-sm font-semibold text-gray-700">
                Select Spice
                <div className="mt-2 flex flex-wrap gap-2">
                  {spiceLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        options.spiceLevel === level
                          ? 'border-gold bg-gold text-[#0b0b0b]'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gold/50'
                      }`}
                      onClick={() => setOptions({ ...options, spiceLevel: level })}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </label>
            )}

            <div className="mb-4 space-y-2">
              {selectedItem.customization?.extras && (
                <>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={options.addCheese}
                      onChange={(e) => setOptions({ ...options, addCheese: e.target.checked })}
                    />
                    Add Cheese +$5
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={options.addEgg}
                      onChange={(e) => setOptions({ ...options, addEgg: e.target.checked })}
                    />
                    Add Egg +$3
                  </label>
                </>
              )}
              {selectedItem.displayCategory === 'Burgers' && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={options.combo}
                    onChange={(e) => setOptions({ ...options, combo: e.target.checked })}
                  />
                  Fries & drink combo +$7
                </label>
              )}
            </div>

            <div className="mb-6 flex items-center justify-center gap-4">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-lg font-bold hover:bg-gray-50"
                onClick={() => setOptions({ ...options, quantity: Math.max(1, options.quantity - 1) })}
              >
                -
              </button>
              <span className="min-w-[2rem] text-center text-lg font-bold">{options.quantity}</span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-lg font-bold hover:bg-gray-50"
                onClick={() => setOptions({ ...options, quantity: options.quantity + 1 })}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="w-full cursor-pointer rounded-full bg-brand-orange py-3 font-bold text-ink hover:bg-[#e85f2a]"
              onClick={() => addToCart(selectedItem)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderOnlinePage;
