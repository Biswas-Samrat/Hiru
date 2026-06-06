import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api, { API_URL } from '../lib/api';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { setCached, invalidateCache } from '../lib/adminCache';
import ConfirmDialog from '../components/ConfirmDialog';

const socket = io(API_URL);

const Reservations = () => {
  const { data: reservations, loading, setData: setReservations } = useCachedQuery(
    'reservations',
    () => api.get('/api/reservations').then((res) => res.data),
    []
  );
  const [updatingId, setUpdatingId] = useState(null);
  const [dialog, setDialog] = useState({ open: false, id: null, name: '' });
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
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

    return () => {
      socket.off('newReservation');
      socket.off('adminReservationUpdate');
    };
  }, [setReservations]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/api/reservations/${id}/status`, { status });
      setReservations((current) => {
        const next = (current || []).map((r) => ((r.id || r._id) === id ? res.data : r));
        setCached('reservations', next);
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const openMoveDialog = (id, name) => setDialog({ open: true, id, name });
  const closeDialog = () => setDialog({ open: false, id: null, name: '' });

  const confirmMoveToHistory = async () => {
    const id = dialog.id;
    closeDialog();
    setMovingId(id);
    try {
      await api.post(`/api/reservation-history/${id}/move`);
      setReservations((current) => {
        const next = (current || []).filter((r) => (r.id || r._id) !== id);
        setCached('reservations', next);
        invalidateCache('reservationHistory');
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div>
      <ConfirmDialog
        open={dialog.open}
        title="Move to History?"
        message={`This will remove "${dialog.name}'s" reservation from the active list and archive it in Reservation History.`}
        confirmLabel="Yes, move to history"
        danger={false}
        onConfirm={confirmMoveToHistory}
        onCancel={closeDialog}
      />
      <div className="page-header">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2 className="page-title">Table bookings</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm font-semibold text-ink">
          <i className="fa-solid fa-calendar-days text-gold" />
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {loading && !(reservations ?? []).length ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card h-24 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase text-gold">Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Total bookings</span>
                  <span className="font-bold text-ink">{(reservations ?? []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Pending</span>
                  <span className="font-bold text-gold">
                    {(reservations ?? []).filter((r) => r.status === 'Pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:col-span-8">
            {(reservations ?? []).map((res) => {
              const id = res.id || res._id;
              const busy = updatingId === id;
              return (
                <div key={id} className="card flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                  <div className="flex gap-4">
                    <div className="flex min-w-[72px] flex-col items-center justify-center rounded-lg border border-gold/30 bg-gold/5 p-3">
                      <span className="text-2xl font-bold text-gold">{new Date(res.date).getDate()}</span>
                      <span className="text-xs uppercase text-muted">
                        {new Date(res.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
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
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {res.status === 'Pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateStatus(id, 'Confirmed')}
                          className="btn-primary bg-green-700 hover:bg-green-800"
                        >
                          {busy ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-check" />}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateStatus(id, 'Cancelled')}
                          className="btn-secondary text-red-600"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </>
                    ) : (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          res.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={movingId === id}
                      onClick={() => openMoveDialog(id, res.customerInfo?.name || 'this reservation')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                      title="Move to history"
                    >
                      {movingId === id
                        ? <i className="fa-solid fa-spinner fa-spin" />
                        : <i className="fa-solid fa-clock-rotate-left" />}
                      Move to History
                    </button>
                  </div>
                </div>
              );
            })}
            {(reservations ?? []).length === 0 && (
              <div className="card p-12 text-center text-muted">No table bookings yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
