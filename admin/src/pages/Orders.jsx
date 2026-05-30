import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api, { API_URL } from '../lib/api';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { setCached } from '../lib/adminCache';

const socket = io(API_URL);
const activeStatuses = ['Pending', 'Accepted', 'Preparing', 'Almost Ready', 'Ready for Pickup'];

const Orders = () => {
  const { data: orders, loading, setData: setOrders } = useCachedQuery(
    'orders',
    () => api.get('/api/orders').then((res) => res.data),
    []
  );
  const [prepTimes, setPrepTimes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    socket.on('newOrder', (newOrder) => {
      setOrders((prev) => {
        const next = [newOrder, ...(prev || [])];
        setCached('orders', next);
        return next;
      });
    });
    socket.on('adminOrderUpdate', (updatedOrder) => {
      setOrders((prev) => {
        const next = (prev || []).map((order) =>
          (order.id || order._id) === (updatedOrder.id || updatedOrder._id) ? updatedOrder : order
        );
        setCached('orders', next);
        return next;
      });
    });

    return () => {
      socket.off('newOrder');
      socket.off('adminOrderUpdate');
    };
  }, [setOrders]);

  const updateStatus = async (id, status, prepTimer = null) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/api/orders/${id}/status`, { status, preparationTimer: prepTimer });
      setOrders((current) => {
        const next = (current || []).map((order) => ((order.id || order._id) === id ? res.data : order));
        setCached('orders', next);
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOrders = (orders ?? []).filter((order) => activeStatuses.includes(order.status));

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Orders</p>
          <h2 className="page-title">Live takeaway orders</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold uppercase text-green-800">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Kitchen connected
        </div>
      </div>

      {loading && !(orders ?? []).length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="card h-48 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {activeOrders.map((order) => {
            const orderId = order.id || order._id;
            const busy = updatingId === orderId;
            return (
              <div
                key={orderId}
                className={`card p-5 ${order.status === 'Pending' ? 'ring-2 ring-gold/40' : ''}`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gold">#{String(orderId).slice(-6).toUpperCase()}</h3>
                    <p className="text-sm text-muted">
                      {order.customerInfo?.name} · {order.customerInfo?.phone}
                    </p>
                    <p className="text-sm text-muted">
                      Pickup · {order.customerInfo?.paymentMethod === 'online' ? 'Paid online' : 'Pay on collection'}
                    </p>
                    {order.customerInfo?.notes && (
                      <p className="mt-2 text-sm text-amber-800">{order.customerInfo.notes}</p>
                    )}
                  </div>
                  <div className="text-end">
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink">{order.status}</span>
                    <p className="mt-2 text-xs text-muted">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  {(order.items || []).map((item, index) => (
                    <div key={`${orderId}-${index}`} className="flex justify-between border-b border-border pb-2 text-sm">
                      <span>
                        {item.quantity}x {item.itemName || 'Item'}
                      </span>
                      <span className="text-muted">
                        {[item.curryBase, item.spiceLevel, ...(item.extras || []).map((extra) => extra.name)]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  {order.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateStatus(orderId, 'Accepted')}
                        className="btn-primary flex-grow bg-green-700 hover:bg-green-800"
                      >
                        {busy ? <i className="fa-solid fa-spinner fa-spin" /> : 'Accept'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateStatus(orderId, 'Rejected')}
                        className="btn-secondary flex-grow text-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === 'Accepted' && (
                    <div className="flex w-full gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Mins"
                        value={prepTimes[orderId] || order.preparationTimer || 15}
                        onChange={(e) => setPrepTimes({ ...prepTimes, [orderId]: e.target.value })}
                        className="input-field max-w-[100px]"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateStatus(orderId, 'Preparing', prepTimes[orderId] || order.preparationTimer || 15)}
                        className="btn-primary flex-grow"
                      >
                        {busy ? <i className="fa-solid fa-spinner fa-spin" /> : 'Start prep'}
                      </button>
                    </div>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => updateStatus(orderId, 'Almost Ready')}
                      className="btn-primary flex-grow"
                    >
                      {busy ? <i className="fa-solid fa-spinner fa-spin" /> : 'Almost ready'}
                    </button>
                  )}
                  {order.status === 'Almost Ready' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => updateStatus(orderId, 'Ready for Pickup')}
                      className="btn-primary flex-grow bg-green-700 hover:bg-green-800"
                    >
                      {busy ? <i className="fa-solid fa-spinner fa-spin" /> : 'Ready for pickup'}
                    </button>
                  )}
                  {order.status === 'Ready for Pickup' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => updateStatus(orderId, 'Completed')}
                      className="btn-secondary flex-grow"
                    >
                      {busy ? <i className="fa-solid fa-spinner fa-spin" /> : 'Collected'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {activeOrders.length === 0 && (
            <div className="card col-span-full p-12 text-center text-muted">No active takeaway orders right now.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
