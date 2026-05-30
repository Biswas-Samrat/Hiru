import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../data/menuData';
import { saveTrackedOrder } from './OrderTrackingHub';
import SorryDialog from '../components/SorryDialog';

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

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCart);
  const [submitting, setSubmitting] = useState(false);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [showSorryDialog, setShowSorryDialog] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    paymentMethod: 'cash',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/api/settings`)
      .then((res) => setOrderingEnabled(res.data.onlineOrderingEnabled !== false))
      .catch(() => setOrderingEnabled(true));
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0), [cart]);
  const prepTime = cart.length
    ? Math.max(...cart.map((item) => Number(item.prepTime || 15))) + Math.max(0, cart.length - 1) * 2
    : 0;

  const removeFromCart = (cartId) => {
    const nextCart = cart.filter((item) => item.cartId !== cartId);
    setCart(nextCart);
    saveCart(nextCart);
  };

  const updateQuantity = (cartId, quantity) => {
    const nextCart = cart.map((item) => {
      if (item.cartId !== cartId) return item;
      const nextQuantity = Math.max(1, quantity);
      return {
        ...item,
        quantity: nextQuantity,
        lineTotal: Number(item.unitPrice || item.price || 0) * nextQuantity,
      };
    });
    setCart(nextCart);
    saveCart(nextCart);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!orderingEnabled) {
      setShowSorryDialog(true);
      return;
    }

    if (!cart.length) {
      toast.error('Add at least one item to your cart first.');
      return;
    }

    if (customer.paymentMethod === 'online') {
      const cardDigits = customer.cardNumber.replace(/\s/g, '');
      if (cardDigits.length < 12 || !customer.cardExpiry || customer.cardCvc.length < 3) {
        toast.error('Please complete the payment details.');
        return;
      }
    }

    const readyTime = new Date(Date.now() + prepTime * 60000);
    const payload = {
      items: cart,
      totalAmount: Number(subtotal.toFixed(2)),
      customerInfo: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        fulfillment: 'pickup',
        notes: customer.notes,
        paymentMethod: customer.paymentMethod,
        paymentStatus: customer.paymentMethod === 'online' ? 'Paid' : 'Pay on collection',
      },
      estimatedReadyTime: readyTime,
      preparationTimer: prepTime,
    };

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/orders`, payload);
      saveTrackedOrder(res.data);
      saveCart([]);
      setCart([]);
      toast.success('Order sent to the kitchen.');
      navigate(`/order-tracking/${res.data.id || res.data._id}`);
    } catch (error) {
      if (error.response?.status === 403) {
        setShowSorryDialog(true);
      } else {
        toast.error(error.response?.data?.message || 'Could not place the order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-16 pt-28 text-gray-900">
      <SorryDialog
        open={showSorryDialog}
        onClose={() => setShowSorryDialog(false)}
        title="Sorry — we are not taking orders right now"
        message="We cannot accept online takeaway orders at the moment. Please call us or visit in person. We hope to see you again soon!"
      />

      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Your Cart</p>
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Confirm takeaway pickup.</h1>
          <p className="text-gray-600">Review your items, add customer details, and send the order to the restaurant.</p>
        </div>

        <form className="grid gap-6 lg:grid-cols-12 lg:items-start" onSubmit={handleSubmit}>
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">Cart Items</h2>
              <div className="space-y-4">
                {cart.length === 0 && <p className="text-gray-500">Your cart is empty.</p>}
                {cart.map((item) => (
                  <div
                    className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    key={item.cartId}
                  >
                    <button
                      type="button"
                      className="mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500"
                      aria-label="Remove item"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-gray-900">{item.itemName}</strong>
                      <span className="text-sm text-gray-500">
                        {[item.curryBase, item.spiceLevel, ...(item.extras || []).map((extra) => extra.name)]
                          .filter(Boolean)
                          .join(' | ')}
                      </span>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-gray-200">
                        <button
                          type="button"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-gray-50"
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="min-w-[1.5rem] text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-gray-50"
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <b className="shrink-0 font-bold text-gold">{formatCurrency(item.lineTotal)}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Pickup Details</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-amber-50 px-3 py-1 text-sm font-semibold text-gold">
                  <i className="fa-regular fa-clock" /> {prepTime ? `${prepTime} min` : 'Prep time'}
                </span>
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <i className="fa-solid fa-store text-gold" />
                Takeaway pickup only. No delivery.
              </div>

              <div className="mb-4 space-y-2">
                <input
                  className={inputLight}
                  required
                  placeholder="Name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={inputLight}
                    required
                    placeholder="Phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                  <input
                    className={inputLight}
                    type="email"
                    required
                    placeholder="Email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>
                <textarea
                  className={`${inputLight} min-h-[5rem] resize-y`}
                  rows="2"
                  placeholder="Kitchen notes"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2">
                <label
                  className={`cursor-pointer rounded-lg border px-3 py-3 text-center text-sm font-semibold transition-colors ${
                    customer.paymentMethod === 'cash'
                      ? 'border-gold bg-amber-50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gold/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={customer.paymentMethod === 'cash'}
                    onChange={() => setCustomer({ ...customer, paymentMethod: 'cash' })}
                  />
                  Cash on pickup
                </label>
                <label
                  className={`cursor-pointer rounded-lg border px-3 py-3 text-center text-sm font-semibold transition-colors ${
                    customer.paymentMethod === 'online'
                      ? 'border-gold bg-amber-50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gold/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={customer.paymentMethod === 'online'}
                    onChange={() => setCustomer({ ...customer, paymentMethod: 'online' })}
                  />
                  Pay during order
                </label>
              </div>

              {customer.paymentMethod === 'online' && (
                <div className="mb-4 space-y-2">
                  <input
                    className={inputLight}
                    placeholder="Name on card"
                    value={customer.cardName}
                    onChange={(e) => setCustomer({ ...customer, cardName: e.target.value })}
                  />
                  <input
                    className={inputLight}
                    inputMode="numeric"
                    placeholder="Card number"
                    value={customer.cardNumber}
                    onChange={(e) => setCustomer({ ...customer, cardNumber: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputLight}
                      placeholder="MM/YY"
                      value={customer.cardExpiry}
                      onChange={(e) => setCustomer({ ...customer, cardExpiry: e.target.value })}
                    />
                    <input
                      className={inputLight}
                      inputMode="numeric"
                      placeholder="CVC"
                      value={customer.cardCvc}
                      onChange={(e) => setCustomer({ ...customer, cardCvc: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="mb-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <b className="text-gray-900">{formatCurrency(subtotal)}</b>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <b className="text-gray-900">Not available</b>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <b className="text-gold">{formatCurrency(subtotal)}</b>
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submitting || !cart.length}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin me-2" />
                    Sending order...
                  </>
                ) : (
                  'Place Takeaway Order'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CartPage;
