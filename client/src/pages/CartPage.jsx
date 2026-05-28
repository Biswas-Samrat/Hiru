import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../data/menuData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CART_KEY = 'hirans-cart';

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
    axios.get(`${API_URL}/api/settings`)
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
      toast.error('Online ordering is currently switched off.');
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
      saveCart([]);
      setCart([]);
      toast.success('Order sent to the kitchen.');
      navigate(`/order-tracking/${res.data.id || res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not place the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-page cart-page">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Your Cart</p>
          <h1>Confirm takeaway pickup.</h1>
          <p>Review your items, add customer details, and send the order to the restaurant.</p>
        </div>

        {!orderingEnabled && (
          <div className="service-disabled">
            <i className="fa-solid fa-circle-pause" />
            Online ordering is currently switched off by the restaurant.
          </div>
        )}

        <form className="row g-4 align-items-start" onSubmit={handleSubmit}>
          <div className="col-lg-7">
            <div className="checkout-panel position-static">
              <h2>Cart Items</h2>
              <div className="cart-lines cart-page-lines">
                {cart.length === 0 && <p className="text-secondary mb-0">Your cart is empty.</p>}
                {cart.map((item) => (
                  <div className="cart-line cart-page-line" key={item.cartId}>
                    <button type="button" aria-label="Remove item" onClick={() => removeFromCart(item.cartId)}>
                      <i className="fa-solid fa-xmark" />
                    </button>
                    <div>
                      <strong>{item.itemName}</strong>
                      <span>{[item.curryBase, item.spiceLevel, ...(item.extras || []).map((extra) => extra.name)].filter(Boolean).join(' | ')}</span>
                      <div className="quantity-mini">
                        <button type="button" onClick={() => updateQuantity(item.cartId, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.cartId, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <b>{formatCurrency(item.lineTotal)}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="checkout-panel position-static">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Pickup Details</h2>
                <span className="timer-pill"><i className="fa-regular fa-clock" /> {prepTime ? `${prepTime} min` : 'Prep time'}</span>
              </div>

              <div className="pickup-only-note">
                <i className="fa-solid fa-store" />
                Takeaway pickup only. No delivery.
              </div>

              <div className="row g-2">
                <div className="col-12">
                  <input className="form-control" required placeholder="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control" required placeholder="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control" type="email" required placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                </div>
                <div className="col-12">
                  <textarea className="form-control" rows="2" placeholder="Kitchen notes" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} />
                </div>
              </div>

              <div className="payment-box">
                <label className={customer.paymentMethod === 'cash' ? 'active' : ''}>
                  <input type="radio" name="payment" checked={customer.paymentMethod === 'cash'} onChange={() => setCustomer({ ...customer, paymentMethod: 'cash' })} />
                  Cash on pickup
                </label>
                <label className={customer.paymentMethod === 'online' ? 'active' : ''}>
                  <input type="radio" name="payment" checked={customer.paymentMethod === 'online'} onChange={() => setCustomer({ ...customer, paymentMethod: 'online' })} />
                  Pay during order
                </label>
              </div>

              {customer.paymentMethod === 'online' && (
                <div className="row g-2">
                  <div className="col-12">
                    <input className="form-control" placeholder="Name on card" value={customer.cardName} onChange={(e) => setCustomer({ ...customer, cardName: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <input className="form-control" inputMode="numeric" placeholder="Card number" value={customer.cardNumber} onChange={(e) => setCustomer({ ...customer, cardNumber: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" placeholder="MM/YY" value={customer.cardExpiry} onChange={(e) => setCustomer({ ...customer, cardExpiry: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <input className="form-control" inputMode="numeric" placeholder="CVC" value={customer.cardCvc} onChange={(e) => setCustomer({ ...customer, cardCvc: e.target.value })} />
                  </div>
                </div>
              )}

              <div className="totals">
                <span>Subtotal <b>{formatCurrency(subtotal)}</b></span>
                <span>Delivery <b>Not available</b></span>
                <strong>Total <b>{formatCurrency(subtotal)}</b></strong>
              </div>

              <button type="submit" className="btn btn-warning text-dark fw-bold w-100 py-3" disabled={submitting || !orderingEnabled}>
                {submitting ? 'Sending Order...' : 'Place Takeaway Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CartPage;
