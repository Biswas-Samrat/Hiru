import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../data/menuData';
import { saveTrackedOrder } from './OrderTrackingHub';
import SorryDialog from '../components/SorryDialog';
import StripePaymentForm from '../components/StripePaymentForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CART_KEY = 'hirans-cart';
const PENDING_ONLINE_ORDER_KEY = 'hirans-pending-online-order';

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

// ─────────────────────────────────────────────────────────────────────────────
// Payment step machine
//
//  'form'      → customer fills in details and picks payment method
//  'stripe'    → Stripe Payment + Express Checkout Elements are mounted
//  'awaiting'  → confirmPayment resolved without redirect (card payment);
//                webhook is the authority — order tracking shows live status
//  'error'     → payment declined / failed; user can retry (same clientSecret)
// ─────────────────────────────────────────────────────────────────────────────

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCart);
  const [submitting, setSubmitting] = useState(false);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [showSorryDialog, setShowSorryDialog] = useState(false);

  // Stripe state
  const [paymentStep, setPaymentStep] = useState('form'); // 'form'|'stripe'|'awaiting'|'error'
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeOrderId, setStripeOrderId] = useState('');
  const [stripeError, setStripeError] = useState('');

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/api/settings`)
      .then((res) => setOrderingEnabled(res.data.onlineOrderingEnabled !== false))
      .catch(() => setOrderingEnabled(true));
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    [cart],
  );
  const prepTime = cart.length
    ? Math.max(...cart.map((item) => Number(item.prepTime || 15))) + Math.max(0, cart.length - 1) * 2
    : 0;

  const removeFromCart = (cartId) => {
    const next = cart.filter((item) => item.cartId !== cartId);
    setCart(next);
    saveCart(next);
  };

  const updateQuantity = (cartId, quantity) => {
    const next = cart.map((item) => {
      if (item.cartId !== cartId) return item;
      const qty = Math.max(1, quantity);
      return { ...item, quantity: qty, lineTotal: Number(item.unitPrice || item.price || 0) * qty };
    });
    setCart(next);
    saveCart(next);
  };

  // ── Form submit — creates order + PaymentIntent (online) or plain order (cash) ──
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isStripeStep) return;

    if (!orderingEnabled) { setShowSorryDialog(true); return; }
    if (!cart.length) { toast.error('Add at least one item first.'); return; }

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
        paymentStatus: customer.paymentMethod === 'online' ? 'PENDING_STRIPE' : 'UNPAID - CASH',
      },
      estimatedReadyTime: readyTime,
      preparationTimer: prepTime,
    };

    setSubmitting(true);
    try {
      if (customer.paymentMethod === 'online') {
        // ── Step 1: create PaymentIntent → get clientSecret ────────────────
        const res = await axios.post(`${API_URL}/api/payments/create-payment-intent`, payload);
        setStripeClientSecret(res.data.clientSecret);
        setStripeOrderId(res.data.orderId);
        localStorage.setItem(PENDING_ONLINE_ORDER_KEY, res.data.orderId);
        setPaymentStep('stripe');
        // Scroll the payment panel into view
        setTimeout(
          () => document.getElementById('payment-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          120,
        );
      } else {
        // ── Cash flow (unchanged) ──────────────────────────────────────────
        const res = await axios.post(`${API_URL}/api/orders`, payload);
        saveTrackedOrder(res.data);
        saveCart([]);
        setCart([]);
        toast.success('Order sent to the kitchen.');
        navigate(`/order-tracking/${res.data.id || res.data._id}`);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setShowSorryDialog(true);
      } else {
        toast.error(
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Could not place the order. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Called by StripePaymentForm when confirmPayment resolves on-page ───────
  // opts.redirect = false → card payment, stay on page and show awaiting state
  // opts.redirect = true  → shouldn't reach here (Stripe redirected instead)
  const handlePaymentSuccess = (orderId, opts = {}) => {
    localStorage.setItem(PENDING_ONLINE_ORDER_KEY, orderId);

    if (opts.redirect === false) {
      // Card payment confirmed client-side.
      // Webhook is the source of truth — navigate to order tracking so the
      // customer can see the real-time status update when the webhook fires.
      setPaymentStep('awaiting');
      setTimeout(() => navigate(`/order-tracking/${orderId}?pending=true`), 2000);
    }
    // (If Stripe redirected, this callback is never called — the return_url handles it)
  };

  // ── Called by StripePaymentForm when confirmPayment returns an error ────────
  const handlePaymentError = (message) => {
    setStripeError(message);
    setPaymentStep('error');
  };

  // ── Let the customer retry with the same PaymentIntent / clientSecret ───────
  const handleRetry = () => {
    setStripeError('');
    setPaymentStep('stripe');
  };

  // ── Go back to order form (before Stripe Elements are mounted) ────────────
  const handleCancelPayment = () => {
    setStripeClientSecret('');
    setStripeOrderId('');
    setStripeError('');
    localStorage.removeItem(PENDING_ONLINE_ORDER_KEY);
    setPaymentStep('form');
    toast('Payment cancelled. Your cart is still here.', { icon: 'ℹ️' });
  };

  // ── Derived flags ──────────────────────────────────────────────────────────
  const isStripeStep  = paymentStep === 'stripe' || paymentStep === 'error';
  const isAwaitingStep = paymentStep === 'awaiting';
  const lockCart = isStripeStep || isAwaitingStep; // disable cart edits while paying

  return (
    <div className="min-h-screen bg-white pb-16 pt-28 text-gray-900">
      <SorryDialog
        open={showSorryDialog}
        onClose={() => setShowSorryDialog(false)}
        title="Sorry — we are not taking orders right now"
        message="We cannot accept online takeaway orders at the moment. Please call us or visit in person. We hope to see you again soon!"
      />

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Your Cart</p>
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Confirm takeaway pickup.</h1>
          <p className="text-gray-600">Review your items, add customer details, and send the order to the restaurant.</p>
        </div>

        <form className="grid gap-6 lg:grid-cols-12 lg:items-start" onSubmit={handleSubmit}>

          {/* ── Left column: Cart Items ────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold">Cart Items</h2>
              <div className="space-y-4">
                {cart.length === 0 && <p className="text-gray-500">Your cart is empty.</p>}
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <button
                      type="button"
                      className="mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500 disabled:opacity-30"
                      aria-label="Remove item"
                      onClick={() => removeFromCart(item.cartId)}
                      disabled={lockCart}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface flex items-center justify-center text-gold border border-gray-100">
                      {item.image && !item.image.includes('unsplash.com') ? (
                        <img src={item.image} alt={item.itemName} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <i className="fa-solid fa-bowl-food text-xl" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <strong className="block text-gray-900">{item.itemName}</strong>
                      <span className="text-sm text-gray-500">
                        {[item.curryBase, item.spiceLevel, ...(item.extras || []).map((e) => e.name)]
                          .filter(Boolean)
                          .join(' | ')}
                      </span>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-gray-200">
                        <button
                          type="button"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          disabled={lockCart}
                        >-</button>
                        <span className="min-w-[1.5rem] text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          disabled={lockCart}
                        >+</button>
                      </div>
                    </div>
                    <b className="shrink-0 font-bold text-gold">{formatCurrency(item.lineTotal)}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: dynamic panel ───────────────────────────────── */}
          <div className="lg:col-span-5" id="payment-panel">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">

              {/* ═══ AWAITING WEBHOOK (card payment submitted on-page) ═══ */}
              {isAwaitingStep && (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-300">
                    <i className="fa-solid fa-spinner fa-spin text-amber-500 text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Payment received!</h2>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                      Your payment is being confirmed. Redirecting to your order tracker…
                    </p>
                  </div>
                  <div className="w-full rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-800 text-left flex gap-2">
                    <i className="fa-solid fa-circle-info mt-0.5 shrink-0" />
                    <span>Your order status will update to <strong>Paid</strong> within a few seconds once Stripe confirms the payment.</span>
                  </div>
                </div>
              )}

              {/* ═══ STRIPE PAYMENT ELEMENT ═══ */}
              {isStripeStep && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Secure Payment</h2>
                    <button
                      type="button"
                      onClick={handleCancelPayment}
                      className="text-xs text-gray-400 hover:text-gray-700 underline"
                    >
                      ← Edit order
                    </button>
                  </div>

                  {/* Amount summary */}
                  <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-4 py-2.5 text-sm">
                    <span className="text-gray-600 font-medium">Total due (NZD)</span>
                    <b className="text-gold text-base font-bold">{formatCurrency(subtotal)}</b>
                  </div>

                  {/* Retryable error banner */}
                  {paymentStep === 'error' && stripeError && (
                    <div
                      role="alert"
                      className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
                        <span>{stripeError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="text-xs font-bold text-red-600 underline hover:text-red-800"
                      >
                        Try a different card →
                      </button>
                    </div>
                  )}

                  <StripePaymentForm
                    clientSecret={stripeClientSecret}
                    orderId={stripeOrderId}
                    totalAmountFormatted={formatCurrency(subtotal)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </>
              )}

              {/* ═══ ORDER FORM ═══ */}
              {!isStripeStep && !isAwaitingStep && (
                <>
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
                    <input className={inputLight} required placeholder="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input className={inputLight} required placeholder="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                      <input className={inputLight} type="email" required placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                    </div>
                    <textarea
                      className={`${inputLight} min-h-[5rem] resize-y`}
                      rows="2"
                      placeholder="Kitchen notes"
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    />
                  </div>

                  {/* Payment method selector */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {['cash', 'online'].map((method) => (
                      <label
                        key={method}
                        className={`cursor-pointer rounded-lg border px-3 py-3 text-center text-sm font-semibold transition-colors ${
                          customer.paymentMethod === method
                            ? 'border-gold bg-amber-50 text-gray-900'
                            : 'border-gray-200 text-gray-600 hover:border-gold/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          className="sr-only"
                          checked={customer.paymentMethod === method}
                          onChange={() => setCustomer({ ...customer, paymentMethod: method })}
                        />
                        {method === 'cash' ? 'Cash on pickup' : 'Pay during order'}
                      </label>
                    ))}
                  </div>

                  {/* Stripe security badge */}
                  {customer.paymentMethod === 'online' && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      <i className="fa-solid fa-shield-halved text-amber-500 text-sm" />
                      <span>
                        Secured by <strong>Stripe</strong>. Card, Apple Pay &amp; Google Pay accepted.
                        Payment stays on this page.
                      </span>
                    </div>
                  )}

                  {/* Order total */}
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

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    disabled={submitting || !cart.length}
                  >
                    {submitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin me-2" />
                        {customer.paymentMethod === 'online' ? 'Setting up payment…' : 'Sending order…'}
                      </>
                    ) : customer.paymentMethod === 'online' ? (
                      <>
                        <i className="fa-solid fa-lock me-2" />
                        Continue to Payment
                      </>
                    ) : (
                      'Place Takeaway Order'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CartPage;
