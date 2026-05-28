import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import { Link } from 'react-router-dom';
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
// Retained for legacy tabs if needed
const ORDER_CATEGORIES = ['Kottu', 'Rice', 'Burgers', 'Fusion'];

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
  // Filter state – default "All" shows every item
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeCategory, setActiveCategory] = useState('Kottu');
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState(getCart);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
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

    Promise.allSettled([
      axios.get(`${API_URL}/api/menu`),
      axios.get(`${API_URL}/api/settings`),
    ]).then(([menuResult, settingsResult]) => {
      if (!active) return;

      if (menuResult.status === 'fulfilled' && Array.isArray(menuResult.value.data) && menuResult.value.data.length) {
        setMenuItems(
          menuResult.value.data
            .filter((item) => item.isAvailable !== false && item.isOutOfStock !== true)
            .map(normaliseApiItem)
        );
      }

      if (settingsResult.status === 'fulfilled') {
        setOrderingEnabled(settingsResult.value.data.onlineOrderingEnabled !== false);
      }
    });

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

  const orderNow = (item) => {
    if (!item || !orderingEnabled) return;
    // Direct order without customization options
    const unitPrice = Number(item.price);
    const cartIdParts = [
      item.id,
      getCart().length,
      1,
      unitPrice,
      null,
      null,
      ''
    ];
    const cartItem = {
      cartId: cartIdParts.filter(Boolean).join('-'),
      menuItem: item.id,
      itemName: item.name,
      quantity: 1,
      price: Number(item.price),
      unitPrice,
      lineTotal: unitPrice,
      prepTime: item.prepTime || 15,
      category: item.category,
      curryBase: null,
      spiceLevel: null,
      extras: [],
    };
    const nextCart = [...getCart(), cartItem];
    saveCart(nextCart);
    setCart(nextCart);
    toast.success(`${item.name} added to cart`);
  };

  const addToCart = (item = selectedItem) => {
    if (!item || !orderingEnabled) return;

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
    <div className="order-page redesigned-order-page">
      <div className="container">
        <div className="order-hero">
          <div>
            <p className="eyebrow">Takeaway Only</p>
            <h1>Build your collection order.</h1>
            <p>Choose dishes, add them to your cart, then checkout for pickup. Delivery is not available for this restaurant.</p>
          </div>
          <Link to="/cart" className="cart-summary-pill">
            <i className="fa-solid fa-cart-shopping" />
            <span>{cart.length} items</span>
            <b>{formatCurrency(cartTotal)}</b>
          </Link>
        </div>
        {/* Filter Bar – centered and scrolls with page */}
        <FilterBar
          categories={['All', ...new Set(menuItems.map(i => i.displayCategory))]}
          selected={filterCategory}
          onSelect={setFilterCategory}
        />

        {!orderingEnabled && (
          <div className="service-disabled">
            <i className="fa-solid fa-circle-pause" />
            Online ordering is currently switched off by the restaurant.
          </div>
        )}



        <div className="order-menu-grid">
          {visibleItems.map((item) => (
            <article className="order-item-card" key={item.id}>
              <img src={item.image} alt={item.name} className="order-item-img" />
              <div className="order-item-details">
                <div className="order-item-header">
                  <h2 className="order-item-title">{item.code ? `${item.code}. ` : ''}{item.name}</h2>
                  <span className="order-item-price">{formatCurrency(item.price)}</span>
                </div>
                <p className="order-item-desc">{item.description}</p>
                <div className="order-item-actions">
                  <button
                    type="button"
                    className="order-item-btn btn-primary"
                    disabled={!orderingEnabled}
                    onClick={() => item.customization?.curryBase || item.customization?.spice || item.customization?.extras ? openOptions(item) : addToCart(item)}
                    title="Add to Cart"
                  >
                    <i className="fa-solid fa-bag-shopping" />
                  </button>
                  {/* Direct Order button – bypasses customization */}

                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleItems.length === 0 && (
          <div className="empty-state-panel">No available items in this category right now.</div>
        )}
      </div>

      {selectedItem && (
        <div className="modal-backdrop-custom option-modal" onClick={() => setSelectedItem(null)}>
          <div className="option-dialog" onClick={e => e.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Close" onClick={() => setSelectedItem(null)}>
              <i className="fa-solid fa-xmark" />
            </button>
            <img src={selectedItem.image} alt={selectedItem.name} />
            <h2>{selectedItem.name}</h2>
            <p>{selectedItem.description}</p>

            {selectedItem.customization?.curryBase && (
              <label>
                Choose Your Curry Base
                <select value={options.curryBase} onChange={(e) => setOptions({ ...options, curryBase: e.target.value })}>
                  {curryBases.map((base) => <option key={base}>{base}</option>)}
                </select>
              </label>
            )}

            {selectedItem.customization?.spice && (
              <label>
                Select Spice
                <div className="segmented">
                  {spiceLevels.map((level) => (
                    <button key={level} type="button" className={options.spiceLevel === level ? 'active' : ''} onClick={() => setOptions({ ...options, spiceLevel: level })}>
                      {level}
                    </button>
                  ))}
                </div>
              </label>
            )}

            <div className="extras-grid">
              {selectedItem.customization?.extras && (
                <>
                  <label><input type="checkbox" checked={options.addCheese} onChange={(e) => setOptions({ ...options, addCheese: e.target.checked })} /> Add Cheese +$5</label>
                  <label><input type="checkbox" checked={options.addEgg} onChange={(e) => setOptions({ ...options, addEgg: e.target.checked })} /> Add Egg +$3</label>
                </>
              )}
              {selectedItem.displayCategory === 'Burgers' && (
                <label><input type="checkbox" checked={options.combo} onChange={(e) => setOptions({ ...options, combo: e.target.checked })} /> Fries & drink combo +$7</label>
              )}
            </div>

            <div className="quantity-row">
              <button type="button" onClick={() => setOptions({ ...options, quantity: Math.max(1, options.quantity - 1) })}>-</button>
              <span>{options.quantity}</span>
              <button type="button" onClick={() => setOptions({ ...options, quantity: options.quantity + 1 })}>+</button>
            </div>

            <button type="button" className="btn btn-warning text-dark fw-bold w-100 py-3" onClick={() => addToCart(selectedItem)}>
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderOnlinePage;
