import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import api, { API_URL } from '../lib/api';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { invalidateCache, setCached } from '../lib/adminCache';

const socket = io(API_URL);

const RadioControl = ({ label, description, name, value, checked, onChange, disabled }) => (
  <label
    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
      checked ? 'border-gold bg-gold/10' : 'border-border bg-white hover:border-gold/40'
    } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={() => onChange(value)}
      className="accent-gold"
    />
    <span>
      <b className="block text-sm text-ink">{label}</b>
      {description && <small className="text-muted">{description}</small>}
    </span>
  </label>
);

const DEFAULT_SETTINGS = { onlineOrderingEnabled: true, onlineBookingEnabled: true };

const Dashboard = () => {
  const { data: orders, setData: setOrders } = useCachedQuery(
    'orders',
    () => api.get('/api/orders').then((res) => res.data),
    []
  );
  const { data: reservations, setData: setReservations } = useCachedQuery(
    'reservations',
    () => api.get('/api/reservations').then((res) => res.data),
    []
  );
  const { data: menuItems } = useCachedQuery(
    'menu',
    () => api.get('/api/menu').then((res) => res.data),
    []
  );
  const { data: settings, setData: setSettings } = useCachedQuery(
    'settings',
    () => api.get('/api/settings').then((res) => res.data),
    DEFAULT_SETTINGS
  );

  const [savingOrdering, setSavingOrdering] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);

  useEffect(() => {
    socket.on('newOrder', (order) => {
      setOrders((current) => {
        const next = [order, ...(current || [])];
        setCached('orders', next);
        return next;
      });
    });
    socket.on('adminOrderUpdate', (order) => {
      setOrders((current) => {
        const next = (current || []).map((item) =>
          (item.id || item._id) === (order.id || order._id) ? order : item
        );
        setCached('orders', next);
        return next;
      });
    });
    socket.on('newReservation', (reservation) => {
      setReservations((current) => {
        const next = [reservation, ...(current || [])];
        setCached('reservations', next);
        return next;
      });
    });
    socket.on('adminReservationUpdate', (reservation) => {
      setReservations((current) => {
        const next = (current || []).map((item) =>
          (item.id || item._id) === (reservation.id || reservation._id) ? reservation : item
        );
        setCached('reservations', next);
        return next;
      });
    });
    socket.on('settingsUpdate', (next) => {
      setSettings(next);
      setCached('settings', next);
    });

    return () => {
      socket.off('newOrder');
      socket.off('adminOrderUpdate');
      socket.off('newReservation');
      socket.off('adminReservationUpdate');
      socket.off('settingsUpdate');
    };
  }, [setOrders, setReservations, setSettings]);

  const today = new Date().toDateString();
  const totalOrdersToday = (orders || []).filter(
    (order) => new Date(order.createdAt).toDateString() === today
  ).length;
  const newReservations = (reservations || []).filter((r) => r.status === 'Pending').length;
  const activeTakeawayOrders = (orders || []).filter(
    (order) => !['Completed', 'Cancelled', 'Rejected'].includes(order.status)
  ).length;

  const popularDishes = useMemo(() => {
    const counts = new Map();
    (orders || []).forEach((order) => {
      (order.items || []).forEach((item) => {
        counts.set(item.itemName, (counts.get(item.itemName) || 0) + Number(item.quantity || 1));
      });
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  const updateOrdering = async (enabled) => {
    if (settings.onlineOrderingEnabled === enabled || savingOrdering) return;
    setSavingOrdering(true);
    const next = { ...settings, onlineOrderingEnabled: enabled };
    setSettings(next);
    try {
      const res = await api.put('/api/settings', next);
      setSettings(res.data);
      setCached('settings', res.data);
    } catch {
      invalidateCache('settings');
    } finally {
      setSavingOrdering(false);
    }
  };

  const updateBooking = async (enabled) => {
    if (settings.onlineBookingEnabled === enabled || savingBooking) return;
    setSavingBooking(true);
    const next = { ...settings, onlineBookingEnabled: enabled };
    setSettings(next);
    try {
      const res = await api.put('/api/settings', next);
      setSettings(res.data);
      setCached('settings', res.data);
    } catch {
      invalidateCache('settings');
    } finally {
      setSavingBooking(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2 className="page-title">Welcome back, Chef Hiran</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold uppercase text-green-800">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live kitchen data
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Orders today', totalOrdersToday],
          ['Pending reservations', newReservations],
          ['Active orders', activeTakeawayOrders],
          ['Menu items', (menuItems ?? []).length],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <span className="text-xs font-bold uppercase text-muted">{label}</span>
            <strong className="mt-2 block text-4xl text-gold">{value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <div className="card h-full p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Online controls</h3>

            <div className="border-t border-border py-4 first:border-t-0">
              <p className="mb-3 font-semibold text-ink">Online ordering</p>
              <p className="mb-3 text-sm text-muted">Customers can browse and add to cart; orders are blocked at checkout when off.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <RadioControl
                  name="ordering"
                  label="On"
                  description="Accept takeaway orders"
                  value="on"
                  checked={settings.onlineOrderingEnabled}
                  disabled={savingOrdering}
                  onChange={() => updateOrdering(true)}
                />
                <RadioControl
                  name="ordering"
                  label="Off"
                  description="Sorry message at checkout"
                  value="off"
                  checked={!settings.onlineOrderingEnabled}
                  disabled={savingOrdering}
                  onChange={() => updateOrdering(false)}
                />
              </div>
              {savingOrdering && (
                <p className="mt-2 text-xs text-gold">
                  <i className="fa-solid fa-spinner fa-spin me-1" />
                  Updating...
                </p>
              )}
            </div>

            <div className="border-t border-border py-4">
              <p className="mb-3 font-semibold text-ink">Online table booking</p>
              <p className="mb-3 text-sm text-muted">Customers complete all steps; booking blocked on confirm when off.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <RadioControl
                  name="booking"
                  label="On"
                  description="Accept table bookings"
                  value="on"
                  checked={settings.onlineBookingEnabled}
                  disabled={savingBooking}
                  onChange={() => updateBooking(true)}
                />
                <RadioControl
                  name="booking"
                  label="Off"
                  description="Sorry message on confirm"
                  value="off"
                  checked={!settings.onlineBookingEnabled}
                  disabled={savingBooking}
                  onChange={() => updateBooking(false)}
                />
              </div>
              {savingBooking && (
                <p className="mt-2 text-xs text-gold">
                  <i className="fa-solid fa-spinner fa-spin me-1" />
                  Updating...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-7">
          <div className="card h-full p-5">
            <h3 className="mb-4 text-lg font-bold text-ink">Popular dishes</h3>
            <div className="space-y-2">
              {popularDishes.length === 0 && <p className="text-muted">No order data yet.</p>}
              {popularDishes.map(([name, count], index) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                  <span className="text-ink">
                    {index + 1}. {name}
                  </span>
                  <b className="text-gold">{count} sold</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
