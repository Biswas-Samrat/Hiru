import { useEffect, useMemo, useRef, useState } from 'react';
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

  /* ── Skills editor ─────────────────────────────────────── */
  const DEFAULT_SKILLS = [
    { id: 'willingness', label: 'WILLINGNESS TO LEARN', percentage: 90 },
    { id: 'passion', label: 'GENUINE PASSION', percentage: 80 },
    { id: 'organisation', label: 'ORGANISATION', percentage: 75 },
    { id: 'creativity', label: 'CREATIVITY', percentage: 85 },
    { id: 'time_management', label: 'TIME MANAGEMENT', percentage: 75 },
    { id: 'teamwork', label: 'TEAMWORK', percentage: 95 },
  ];
  const localSkills = settings.skills && settings.skills.length > 0
    ? settings.skills
    : DEFAULT_SKILLS;
  const [skillDraft, setSkillDraft] = useState(null);
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsSaved, setSkillsSaved] = useState(false);
  const skillsRef = useRef(null);

  const activeSkills = skillDraft ?? localSkills;

  const updateSkillPct = (id, raw) => {
    const pct = Math.min(100, Math.max(0, Number(raw)));
    setSkillDraft(activeSkills.map((s) => s.id === id ? { ...s, percentage: pct } : s));
    setSkillsSaved(false);
  };

  const saveSkills = async () => {
    if (savingSkills) return;
    setSavingSkills(true);
    const next = { ...settings, skills: activeSkills };
    try {
      const res = await api.put('/api/settings', next);
      setSettings(res.data);
      setCached('settings', res.data);
      setSkillDraft(null);
      setSkillsSaved(true);
      setTimeout(() => setSkillsSaved(false), 2500);
    } catch {
      invalidateCache('settings');
    } finally {
      setSavingSkills(false);
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

      {/* ── Skills Editor ─────────────────────────────────── */}
      <div ref={skillsRef} className="mt-6">
        <div className="card p-5">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">Chef Skills — Percentages</h3>
              <p className="mt-0.5 text-sm text-muted">
                Adjust the percentage for each skill shown on the public Chef Hiru page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {skillsSaved && (
                <span className="text-sm font-semibold text-green-600">
                  <i className="fa-solid fa-circle-check me-1" />
                  Saved!
                </span>
              )}
              <button
                type="button"
                className="btn-primary gap-2"
                onClick={saveSkills}
                disabled={savingSkills || !skillDraft}
              >
                {savingSkills
                  ? <><i className="fa-solid fa-spinner fa-spin me-1" />Saving…</>
                  : <><i className="fa-solid fa-floppy-disk me-1" />Save changes</>}
              </button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {activeSkills.map((skill) => (
              <div key={skill.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`skill-${skill.id}`}
                    className="text-xs font-bold uppercase tracking-widest text-ink"
                  >
                    {skill.label}
                  </label>
                  <span className="text-sm font-bold text-gold">{skill.percentage}%</span>
                </div>
                {/* Visual bar preview */}
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gold transition-all duration-300"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
                {/* Range slider */}
                <input
                  id={`skill-${skill.id}`}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={skill.percentage}
                  onChange={(e) => updateSkillPct(skill.id, e.target.value)}
                  className="w-full accent-gold"
                />
                {/* Number input for precision */}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={skill.percentage}
                  onChange={(e) => updateSkillPct(skill.id, e.target.value)}
                  className="input-field text-center text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
