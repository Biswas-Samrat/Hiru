import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Users, Phone, Mail, Clock, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reservations`);
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/reservations/${id}/status`, { status });
      setReservations(reservations.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Table Bookings</h2>
        <div className="bg-gold/10 text-gold px-4 py-2 border border-gold/20 flex items-center gap-2">
          <CalendarIcon size={18} />
          <span className="text-sm font-bold">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Placeholder */}
        <div className="lg:col-span-1 card">
          <h3 className="text-gold font-bold uppercase tracking-widest text-xs mb-6 pb-4 border-b border-gold/10">Availability</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Tables</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Available Tonight</span>
              <span className="text-gold font-bold">4</span>
            </div>
            <div className="pt-4">
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gold w-2/3"></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-tighter text-right">66% Occupancy</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {reservations.map(res => (
            <div key={res._id} className="card flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-6">
                <div className="text-center bg-gold/5 border border-gold/10 p-4 min-w-[80px]">
                  <span className="block text-2xl font-serif font-bold text-gold">{new Date(res.date).getDate()}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">{new Date(res.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold">{res.customerInfo.name}</h4>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Users size={14} className="text-gold" /> {res.guests} Guests</span>
                    <span className="flex items-center gap-1"><Clock size={14} className="text-gold" /> {res.time}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Phone size={12} /> {res.customerInfo.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {res.status === 'Pending' ? (
                  <>
                    <button onClick={() => updateStatus(res._id, 'Confirmed')} className="p-2 bg-green-600/20 text-green-500 border border-green-600/30 hover:bg-green-600 hover:text-white transition-all">
                      <Check size={20} />
                    </button>
                    <button onClick={() => updateStatus(res._id, 'Cancelled')} className="p-2 bg-red-600/20 text-red-500 border border-red-600/30 hover:bg-red-600 hover:text-white transition-all">
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <span className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border ${res.status === 'Confirmed' ? 'border-green-600 text-green-500' : 'border-red-600 text-red-500'}`}>
                    {res.status}
                  </span>
                )}
              </div>
            </div>
          ))}
          {reservations.length === 0 && <div className="text-center py-20 text-gray-600 border border-dashed border-gold/10">No bookings for this date</div>}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
