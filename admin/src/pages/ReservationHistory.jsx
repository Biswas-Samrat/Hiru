import { useState } from 'react';
import api from '../lib/api';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { setCached, invalidateCache } from '../lib/adminCache';
import ConfirmDialog from '../components/ConfirmDialog';

const StatusBadge = ({ status }) => {
  const map = {
    Confirmed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Pending: 'bg-amber-100 text-amber-800',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[status] || 'bg-surface text-ink'}`}>
      {status || 'Archived'}
    </span>
  );
};

const ReservationHistory = () => {
  const { data: history, loading, refresh, setData } = useCachedQuery(
    'reservationHistory',
    () => api.get('/api/reservation-history').then((r) => r.data),
    []
  );

  const [dialog, setDialog] = useState({ open: false, type: null, id: null });
  const [busy, setBusy] = useState(false);

  const openDelete = (id) => setDialog({ open: true, type: 'delete', id });
  const openDeleteAll = () => setDialog({ open: true, type: 'deleteAll', id: null });
  const closeDialog = () => setDialog({ open: false, type: null, id: null });

  const handleConfirm = async () => {
    setBusy(true);
    try {
      if (dialog.type === 'delete') {
        await api.delete(`/api/reservation-history/${dialog.id}`);
        const next = (history || []).filter((r) => String(r.id || r._id) !== String(dialog.id));
        setData(next);
        setCached('reservationHistory', next);
      } else if (dialog.type === 'deleteAll') {
        await api.delete('/api/reservation-history/all');
        setData([]);
        setCached('reservationHistory', []);
      }
    } catch (err) {
      console.error(err);
      invalidateCache('reservationHistory');
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
        title={
          dialog.type === 'deleteAll'
            ? 'Clear all reservation history?'
            : 'Delete this record?'
        }
        message={
          dialog.type === 'deleteAll'
            ? 'This will permanently remove all reservation history records. This action cannot be undone.'
            : 'This reservation record will be permanently deleted.'
        }
        confirmLabel={dialog.type === 'deleteAll' ? 'Yes, clear all' : 'Yes, delete'}
        onConfirm={busy ? undefined : handleConfirm}
        onCancel={closeDialog}
      />

      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2 className="page-title">Reservation History</h2>
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
          <i className="fa-solid fa-calendar-xmark mb-4 block text-4xl text-muted/40" />
          <p className="font-semibold text-muted">No reservation history yet.</p>
          <p className="mt-1 text-sm text-muted">
            Use the "Move to History" button on any reservation to archive it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {records.map((res) => {
            const id = String(res.id || res._id);
            return (
              <div
                key={id}
                className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex gap-4">
                  {/* Date badge */}
                  <div className="flex min-w-[72px] flex-col items-center justify-center rounded-lg border border-gold/30 bg-gold/5 p-3">
                    <span className="text-2xl font-bold text-gold">
                      {new Date(res.date).getDate()}
                    </span>
                    <span className="text-xs uppercase text-muted">
                      {new Date(res.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(res.date).getFullYear()}
                    </span>
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="font-bold text-ink">{res.customerInfo?.name}</h4>
                    <p className="mt-1 text-sm text-muted">
                      <i className="fa-solid fa-users me-1 text-gold" />
                      {res.guests} guests · {res.time}
                    </p>
                    <p className="text-sm text-muted">
                      <i className="fa-solid fa-phone me-1" />
                      {res.customerInfo?.phone}
                    </p>
                    {res.customerInfo?.email && (
                      <p className="text-sm text-muted">
                        <i className="fa-solid fa-envelope me-1" />
                        {res.customerInfo.email}
                      </p>
                    )}
                    {res.notes && (
                      <p className="mt-1 text-xs italic text-amber-700">{res.notes}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      Archived: {res.archivedAt ? new Date(res.archivedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={res.status} />
                  <button
                    type="button"
                    onClick={() => openDelete(id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                  >
                    <i className="fa-solid fa-trash" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;
