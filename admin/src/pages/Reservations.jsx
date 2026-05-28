import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchReservations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/reservations`);
        if (active) {
          setReservations(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchReservations();

    socket.on('newReservation', (reservation) => {
      setReservations((current) => [reservation, ...current]);
    });

    socket.on('adminReservationUpdate', (reservation) => {
      setReservations((current) => current.map((item) => (item.id === reservation.id ? reservation : item)));
    });

    return () => {
      active = false;
      socket.off('newReservation');
      socket.off('adminReservationUpdate');
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/reservations/${id}/status`, { status });
      setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="d-flex align-items-center justify-content-center h-100 text-gold"><i className="fa-solid fa-spinner fa-spin fs-3"></i></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="display-6 fw-bold mb-0">Table Bookings</h2>
        <div className="text-gold px-3 py-2 border border-gold rounded d-flex align-items-center gap-2">
          <i className="fa-solid fa-calendar-days"></i>
          <span className="small fw-bold">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="admin-tabs mb-4">
        <a href="/orders">Takeaway Orders</a>
        <a className="active" href="/reservations">Table Bookings</a>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="admin-card p-4">
          <h3 className="text-gold fw-bold text-uppercase small mb-3 pb-3 border-bottom border-gold">Availability</h3>
          <div className="vstack gap-3">
            <div className="d-flex justify-content-between align-items-center small">
              <span className="text-secondary">Total Tables</span>
              <span className="fw-bold">12</span>
            </div>
            <div className="d-flex justify-content-between align-items-center small">
              <span className="text-secondary">Available Tonight</span>
              <span className="text-gold fw-bold">4</span>
            </div>
            <div className="pt-2">
              <div className="progress bg-dark" style={{ height: '8px' }}>
                <div className="progress-bar bg-gold" style={{ width: '66%' }}></div>
              </div>
              <p className="small text-secondary mt-2 mb-0 text-end">66% Occupancy</p>
            </div>
          </div>
          </div>
        </div>

        <div className="col-12 col-lg-8 d-grid gap-3">
          {reservations.map(res => (
            <div key={res.id} className="admin-card p-4 d-flex flex-column flex-md-row justify-content-between gap-4">
              <div className="d-flex gap-4">
                <div className="text-center border border-gold p-3" style={{ minWidth: '80px' }}>
                  <span className="d-block fs-4 fw-bold text-gold">{new Date(res.date).getDate()}</span>
                  <span className="small text-secondary text-uppercase">{new Date(res.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <h4 className="h5 fw-bold">{res.customerInfo.name}</h4>
                  <div className="d-flex gap-3 mt-2 small text-secondary">
                    <span><i className="fa-solid fa-users text-gold me-1"></i>{res.guests} Guests</span>
                    <span><i className="fa-solid fa-clock text-gold me-1"></i>{res.time}</span>
                  </div>
                  <div className="d-flex gap-3 mt-2 small text-secondary">
                    <span><i className="fa-solid fa-phone me-1"></i>{res.customerInfo.phone}</span>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                {res.status === 'Pending' ? (
                  <>
                    <button onClick={() => updateStatus(res.id, 'Confirmed')} className="btn btn-outline-success">
                      <i className="fa-solid fa-check"></i>
                    </button>
                    <button onClick={() => updateStatus(res.id, 'Cancelled')} className="btn btn-outline-danger">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </>
                ) : (
                  <span className={`badge border ${res.status === 'Confirmed' ? 'border-success text-success' : 'border-danger text-danger'}`}>
                    {res.status}
                  </span>
                )}
              </div>
            </div>
          ))}
          {reservations.length === 0 && <div className="text-center py-5 text-secondary border border-gold border-dashed">No bookings for this date</div>}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
