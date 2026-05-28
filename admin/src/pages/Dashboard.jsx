import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [settings, setSettings] = useState({
    onlineOrderingEnabled: true,
    onlineBookingEnabled: true,
  });

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API_URL}/api/orders`),
      axios.get(`${API_URL}/api/reservations`),
      axios.get(`${API_URL}/api/menu`),
      axios.get(`${API_URL}/api/settings`),
    ]).then(([ordersResult, reservationsResult, menuResult, settingsResult]) => {
      if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value.data);
      if (reservationsResult.status === 'fulfilled') setReservations(reservationsResult.value.data);
      if (menuResult.status === 'fulfilled') setMenuItems(menuResult.value.data);
      if (settingsResult.status === 'fulfilled') setSettings(settingsResult.value.data);
    });

    socket.on('newOrder', (order) => setOrders((current) => [order, ...current]));
    socket.on('adminOrderUpdate', (order) => setOrders((current) => current.map((item) => (item.id === order.id ? order : item))));
    socket.on('newReservation', (reservation) => setReservations((current) => [reservation, ...current]));
    socket.on('adminReservationUpdate', (reservation) => setReservations((current) => current.map((item) => (item.id === reservation.id ? reservation : item))));
    socket.on('settingsUpdate', setSettings);

    return () => {
      socket.off('newOrder');
      socket.off('adminOrderUpdate');
      socket.off('newReservation');
      socket.off('adminReservationUpdate');
      socket.off('settingsUpdate');
    };
  }, []);

  const today = new Date().toDateString();
  const totalOrdersToday = orders.filter((order) => new Date(order.createdAt).toDateString() === today).length;
  const newReservations = reservations.filter((reservation) => reservation.status === 'Pending').length;
  const activeTakeawayOrders = orders.filter((order) => !['Completed', 'Cancelled', 'Rejected'].includes(order.status)).length;
  const popularDishes = useMemo(() => {
    const counts = new Map();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        counts.set(item.itemName, (counts.get(item.itemName) || 0) + Number(item.quantity || 1));
      });
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  const updateSettings = async (nextSettings) => {
    setSettings(nextSettings);
    const res = await axios.put(`${API_URL}/api/settings`, nextSettings);
    setSettings(res.data);
  };

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <p className="text-gold text-uppercase small fw-bold mb-2">Dashboard Overview</p>
          <h2 className="display-6 fw-bold mb-0">Welcome back, Chef Hiran.</h2>
        </div>
        <div className="live-status-pill">
          <span />
          Live kitchen data
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="admin-card stat-card">
          <span>Total orders today</span>
          <strong>{totalOrdersToday}</strong>
        </div>
        <div className="admin-card stat-card">
          <span>New reservations</span>
          <strong>{newReservations}</strong>
        </div>
        <div className="admin-card stat-card">
          <span>Active takeaway orders</span>
          <strong>{activeTakeawayOrders}</strong>
        </div>
        <div className="admin-card stat-card">
          <span>Menu items</span>
          <strong>{menuItems.length}</strong>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="admin-card p-4 h-100">
            <h3 className="h5 fw-bold mb-3">Online Controls</h3>
            <label className="admin-toggle">
              <span>
                <b>Online ordering</b>
                <small>Allow customers to place takeaway orders.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.onlineOrderingEnabled}
                onChange={(event) => updateSettings({ ...settings, onlineOrderingEnabled: event.target.checked })}
              />
            </label>
            <label className="admin-toggle">
              <span>
                <b>Online booking</b>
                <small>Allow customers to request table bookings.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.onlineBookingEnabled}
                onChange={(event) => updateSettings({ ...settings, onlineBookingEnabled: event.target.checked })}
              />
            </label>
          </div>
        </div>
        <div className="col-xl-7">
          <div className="admin-card p-4 h-100">
            <h3 className="h5 fw-bold mb-3">Popular dishes</h3>
            <div className="popular-list">
              {popularDishes.length === 0 && <p className="text-secondary mb-0">No order data yet.</p>}
              {popularDishes.map(([name, count], index) => (
                <div key={name}>
                  <span>{index + 1}. {name}</span>
                  <b>{count} sold</b>
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
