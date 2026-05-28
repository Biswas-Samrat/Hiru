import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const activeStatuses = ['Pending', 'Accepted', 'Preparing', 'Almost Ready', 'Ready for Pickup'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prepTimes, setPrepTimes] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    socket.on('newOrder', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    socket.on('adminOrderUpdate', (updatedOrder) => {
      setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
    });

    return () => {
      socket.off('newOrder');
      socket.off('adminOrderUpdate');
    };
  }, []);

  const updateStatus = async (id, status, prepTimer = null) => {
    try {
      const res = await axios.put(`${API_URL}/api/orders/${id}/status`, {
        status,
        preparationTimer: prepTimer,
      });
      setOrders((current) => current.map((order) => (order.id === id ? res.data : order)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="d-flex align-items-center justify-content-center h-100 text-gold"><i className="fa-solid fa-spinner fa-spin fs-3" /></div>;
  }

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <p className="text-gold text-uppercase small fw-bold mb-2">Order Management</p>
          <h2 className="display-6 fw-bold mb-0">Live takeaway orders</h2>
        </div>
        <span className="live-status-pill"><span /> Connected to kitchen</span>
      </div>

      <div className="admin-tabs mb-4">
        <a className="active" href="/orders">Takeaway Orders</a>
        <a href="/reservations">Table Bookings</a>
      </div>

      <div className="row g-4">
        {orders.filter((order) => activeStatuses.includes(order.status)).map((order) => (
          <div key={order.id} className="col-12 col-xl-6">
            <div className={`admin-card p-4 h-100 order-admin-card ${order.status === 'Pending' ? 'urgent' : ''}`}>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h3 className="h4 fw-bold text-gold text-uppercase">#{String(order.id).padStart(4, '0')}</h3>
                  <p className="text-secondary small mb-0">{order.customerInfo?.name} | {order.customerInfo?.phone}</p>
                  <p className="text-secondary small mb-0">Takeaway pickup | {order.customerInfo?.paymentMethod === 'online' ? 'Paid online' : 'Cash on pickup'}</p>
                  {order.customerInfo?.notes && <p className="small text-warning mt-2 mb-0">{order.customerInfo.notes}</p>}
                </div>
                <div className="text-end">
                  <span className={`badge border ${order.status === 'Pending' ? 'border-gold text-gold' : 'border-secondary text-secondary'}`}>
                    {order.status}
                  </span>
                  <p className="small text-secondary mt-2 mb-0">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="vstack gap-2 mb-4">
                {(order.items || []).map((item, index) => (
                  <div key={`${order.id}-${index}`} className="d-flex justify-content-between small order-line">
                    <span>{item.quantity}x {item.itemName || item.menuItem?.name || 'Item'}</span>
                    <span className="text-secondary">{[item.curryBase, item.spiceLevel, ...(item.extras || []).map((extra) => extra.name)].filter(Boolean).join(' | ')}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex flex-wrap gap-2 pt-3 border-top border-gold">
                {order.status === 'Pending' && (
                  <>
                    <button type="button" onClick={() => updateStatus(order.id, 'Accepted')} className="btn btn-success flex-grow-1 fw-bold">
                      Accept
                    </button>
                    <button type="button" onClick={() => updateStatus(order.id, 'Rejected')} className="btn btn-outline-danger flex-grow-1 fw-bold">
                      Reject
                    </button>
                  </>
                )}

                {order.status === 'Accepted' && (
                  <div className="d-flex align-items-center gap-2 w-100">
                    <input
                      type="number"
                      min="1"
                      placeholder="Prep mins"
                      value={prepTimes[order.id] || order.preparationTimer || 15}
                      onChange={(event) => setPrepTimes({ ...prepTimes, [order.id]: event.target.value })}
                      className="form-control form-control-sm bg-black text-white border-gold"
                      style={{ maxWidth: '130px' }}
                    />
                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, 'Preparing', prepTimes[order.id] || order.preparationTimer || 15)}
                      className="btn btn-gold flex-grow-1"
                    >
                      Start Prep
                    </button>
                  </div>
                )}

                {order.status === 'Preparing' && (
                  <button type="button" onClick={() => updateStatus(order.id, 'Almost Ready')} className="btn btn-warning flex-grow-1 fw-bold">
                    Mark Almost Ready
                  </button>
                )}

                {order.status === 'Almost Ready' && (
                  <button type="button" onClick={() => updateStatus(order.id, 'Ready for Pickup')} className="btn btn-success flex-grow-1 fw-bold">
                    Ready for Pickup
                  </button>
                )}

                {order.status === 'Ready for Pickup' && (
                  <button type="button" onClick={() => updateStatus(order.id, 'Completed')} className="btn btn-outline-light flex-grow-1 fw-bold">
                    Finish / Collected
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {orders.filter((order) => activeStatuses.includes(order.status)).length === 0 && (
          <div className="empty-admin-state">No active takeaway orders.</div>
        )}
      </div>
    </div>
  );
};

export default Orders;
