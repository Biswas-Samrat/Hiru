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

  return (
    <div className="min-h-screen bg-white pb-16 pt-28 text-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Takeaway Only</p>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">Build your collection order.</h1>
            <p className="max-w-xl text-gray-600">
              Choose dishes, add them to your cart, then checkout for pickup. Delivery is not available for this restaurant.
            </p>
          </div>
          <Link
            to="/cart"
            className="inline-flex shrink-0 items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-5 py-3 shadow-sm transition-colors hover:border-gold/50"
          >
            <i className="fa-solid fa-cart-shopping text-gold" />
            <span className="font-semibold">{cart.length} items</span>
            <b className="text-gold">{formatCurrency(cartTotal)}</b>
          </Link>
        </div>

        <FilterBar
          categories={['All', ...new Set(menuItems.map((i) => i.displayCategory))]}
          selected={filterCategory}
          onSelect={setFilterCategory}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <article
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg"
              key={item.id}
            >
              <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    {item.code ? `${item.code}. ` : ''}{item.name}
                  </h2>
                  <span className="shrink-0 font-bold text-gold">{formatCurrency(item.price)}</span>
                </div>
                <p className="mb-4 text-sm text-gray-600">{item.description}</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-amber-400 text-black transition-colors hover:bg-amber-300"
                    onClick={() =>
                      item.customization?.curryBase || item.customization?.spice || item.customization?.extras
                        ? openOptions(item)
                        : addToCart(item)
                    }
                    title="Add to Cart"
                  >
                    <i className="fa-solid fa-bag-shopping" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleItems.length === 0 && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
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
              className="w-full rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300"
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
