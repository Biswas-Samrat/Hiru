import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TRACKED_KEY = 'hirans-tracked-orders';
const ACTIVE = ['Pending', 'Accepted', 'Preparing', 'Almost Ready', 'Ready for Pickup'];
const socket = io(API_URL);

export const saveTrackedOrder = (order) => {
  const id = order.id || order._id;
  if (!id) return;
  try {
    const list = JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]');
    const entry = {
      id,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      customerName: order.customerInfo?.name,
    };
    const next = [entry, ...list.filter((o) => o.id !== id)].slice(0, 10);
    localStorage.setItem(TRACKED_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
};

const OrderTrackingHub = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [localOrders, setLocalOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setLocalOrders(JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]'));
    } catch {
      setLocalOrders([]);
    }
  }, []);

  useEffect(() => {
    socket.on('orderUpdate', (updated) => {
      const id = updated.id || updated._id;
      setOrders((current) => current.map((o) => ((o.id || o._id) === id ? updated : o)));
      saveTrackedOrder(updated);
    });
    return () => socket.off('orderUpdate');
  }, []);

  const refreshLocal = () => {
    try {
      setLocalOrders(JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]'));
    } catch {
      setLocalOrders([]);
    }
  };

  const searchOrders = async (event) => {
    event?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = {};
      if (orderId.trim()) params.orderId = orderId.trim();
      else if (email.trim()) params.email = email.trim();
      else if (phone.trim()) params.phone = phone.trim();
      else {
        setError('Enter an order ID, email, or phone number.');
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/orders/track/active`, { params });
      const active = res.data.filter((o) => ACTIVE.includes(o.status));
      setOrders(active);

      active.forEach((o) => {
        socket.emit('joinOrder', o.id || o._id);
        saveTrackedOrder(o);
      });
      refreshLocal();

      if (!active.length) {
        setError('No ongoing orders found for those details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocal = async () => {
    setError('');
    setLoading(true);
    const ids = localOrders.map((o) => o.id).filter(Boolean);
    if (!ids.length) {
      setError('No recent orders on this device. Place an order first or search by email/phone.');
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        ids.map((id) => axios.get(`${API_URL}/api/orders/${id}`))
      );
      const active = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value.data)
        .filter((o) => ACTIVE.includes(o.status));
      setOrders(active);
      if (!active.length) {
        setError('Your recent orders are all completed. Start a new order to track it here.');
      }
    } catch {
      setError('Could not load your recent orders.');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'Ready for Pickup') return 'bg-green-100 text-green-800';
    if (status === 'Preparing' || status === 'Almost Ready') return 'bg-amber-100 text-amber-900';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-cream pb-20 pt-28">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 font-royal text-xs font-bold uppercase tracking-widest text-gold">My orders</p>
          <h1 className="mb-3 text-3xl font-bold text-ink md:text-4xl">Track your orders</h1>
          <p className="text-muted">View all ongoing takeaway orders by ID, email, or phone.</p>
        </div>

        <form className="card-light mb-8 space-y-4 p-6" onSubmit={searchOrders}>
          <label className="block text-sm font-semibold text-ink">
            Order ID
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 bg-surface px-3 py-3 focus:border-gold focus:outline-none"
              placeholder="Paste your order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </label>
          <p className="text-center text-sm text-muted">— or —</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Email
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 bg-surface px-3 py-3 focus:border-gold focus:outline-none"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Phone
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 bg-surface px-3 py-3 focus:border-gold focus:outline-none"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary flex-1 cursor-pointer" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin me-2" />
                  Searching...
                </>
              ) : (
                'Find my order'
              )}
            </button>
            <button className="btn-outline flex-1 cursor-pointer" type="button" onClick={loadFromLocal} disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin me-2" />
                  Loading...
                </>
              ) : (
                'Recent on this device'
              )}
            </button>
          </div>
        </form>

        {orders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-ink">Ongoing orders</h2>
            {orders.map((order) => {
              const id = order.id || order._id;
              return (
                <div key={id} className="card-light p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted">Order</p>
                      <p className="font-mono font-bold text-ink">#{String(id).slice(-8).toUpperCase()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted">
                    Placed {new Date(order.createdAt).toLocaleString()} · ${Number(order.totalAmount || 0).toFixed(2)}
                  </p>
                  {order.estimatedReadyTime && (
                    <p className="mb-4 text-sm text-ink">
                      <i className="fa-regular fa-clock me-2 text-gold" />
                      Est. ready: {new Date(order.estimatedReadyTime).toLocaleTimeString()}
                    </p>
                  )}
                  <Link to={`/order-tracking/${id}`} className="btn-primary inline-flex text-sm">
                    View live tracking
                    <i className="fa-solid fa-arrow-right ms-2" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingHub;
