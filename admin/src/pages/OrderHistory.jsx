import { useState } from 'react';
import api from '../lib/api';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { setCached, invalidateCache } from '../lib/adminCache';
import ConfirmDialog from '../components/ConfirmDialog';

const StatusBadge = ({ status }) => {
  const map = {
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[status] || 'bg-surface text-ink'}`}>
      {status}
    </span>
  );
};

const OrderHistory = () => {
  const { data: history, loading, refresh, setData } = useCachedQuery(
    'orderHistory',
    () => api.get('/api/order-history').then((r) => r.data),
    []
  );

  const [dialog, setDialog] = useState({ open: false, type: null, id: null });
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const openDelete = (id) => setDialog({ open: true, type: 'delete', id });
  const openDeleteAll = () => setDialog({ open: true, type: 'deleteAll', id: null });
  const closeDialog = () => setDialog({ open: false, type: null, id: null });

  const handleConfirm = async () => {
    setBusy(true);
    try {
      if (dialog.type === 'delete') {
        await api.delete(`/api/order-history/${dialog.id}`);
        const next = (history || []).filter((o) => String(o.id || o._id) !== String(dialog.id));
        setData(next);
        setCached('orderHistory', next);
      } else if (dialog.type === 'deleteAll') {
        await api.delete('/api/order-history/all');
        setData([]);
        setCached('orderHistory', []);
      }
    } catch (err) {
      console.error(err);
      invalidateCache('orderHistory');
      refresh(true);
    } finally {
      setBusy(false);
      closeDialog();
    }
  };

  const records = history ?? [];

  return (
    <div>
      <ConfirmDialog
        open={dialog.open}
        title={dialog.type === 'deleteAll' ? 'Clear all order history?' : 'Delete this record?'}
        message={
          dialog.type === 'deleteAll'
            ? 'This will permanently remove all order history records. This action cannot be undone.'
            : 'This order record will be permanently deleted.'
        }
        confirmLabel={dialog.type === 'deleteAll' ? 'Yes, clear all' : 'Yes, delete'}
        onConfirm={busy ? undefined : handleConfirm}
        onCancel={closeDialog}
      />

      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2 className="page-title">Order History</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-ink">
            {records.length} records
          </span>
          {records.length > 0 && (
            <button
              type="button"
              onClick={openDeleteAll}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              <i className="fa-solid fa-trash-can" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {loading && !records.length ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card h-20 animate-pulse bg-surface" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="card p-16 text-center">
          <i className="fa-solid fa-box-archive mb-4 block text-4xl text-muted/40" />
          <p className="font-semibold text-muted">No order history yet.</p>
          <p className="mt-1 text-sm text-muted">Completed and collected orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {records.map((order) => {
            const id = String(order.id || order._id);
            const isExpanded = expandedId === id;
            return (
              <div key={id} className="card overflow-hidden">
                {/* Row header */}
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex min-w-[56px] flex-col items-center justify-center rounded-lg border border-gold/30 bg-gold/5 p-2 text-center">
                      <i className="fa-solid fa-bag-shopping text-gold" />
                      <span className="mt-1 text-xs font-bold text-gold">
                        #{id.slice(-4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-ink">{order.customerInfo?.name}</p>
                      <p className="text-sm text-muted">
                        {order.customerInfo?.phone}
                        {order.customerInfo?.email && ` · ${order.customerInfo.email}`}
                      </p>
                      <p className="text-sm text-muted">
                        {order.originalCreatedAt
                          ? new Date(order.originalCreatedAt).toLocaleString()
                          : order.archivedAt
                          ? new Date(order.archivedAt).toLocaleString()
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold text-gold">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="btn-secondary gap-1 text-xs"
                    >
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} />
                      {isExpanded ? 'Less' : 'Details'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                      title="Delete record"
                    >
                      <i className="fa-solid fa-trash text-xs" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border bg-surface p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                      Items ordered
                    </p>
                    <div className="space-y-1.5">
                      {(order.items || []).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
                        >
                          <span className="font-semibold text-ink">
                            {item.quantity}x {item.itemName || 'Item'}
                          </span>
                          <span className="text-muted">
                            {[item.curryBase, item.spiceLevel, ...(item.extras || []).map((e) => e.name)]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.customerInfo?.notes && (
                      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <i className="fa-solid fa-note-sticky me-1" />
                        {order.customerInfo.notes}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-muted">
                      Payment: {order.customerInfo?.paymentMethod === 'online' ? 'Paid online' : 'Pay on collection'}
                    </p>
                    {order.archivedAt && (
                      <p className="mt-1 text-xs text-muted">
                        Archived: {new Date(order.archivedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
