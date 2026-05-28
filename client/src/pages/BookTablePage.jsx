import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const nzTimeZone = 'Pacific/Auckland';
const MAX_TABLES_PER_SLOT = 4;

const BookTablePage = () => {
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guests, setGuests] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    requests: '',
  });

  const todayNZ = new Date(formatInTimeZone(new Date(), nzTimeZone, "yyyy-MM-dd'T'00:00:00XXX"));
  const lunchTimes = useMemo(() => ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'], []);
  const dinnerTimes = useMemo(() => ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'], []);

  useEffect(() => {
    axios.get(`${API_URL}/api/settings`)
      .then((res) => setBookingEnabled(res.data.onlineBookingEnabled !== false))
      .catch(() => setBookingEnabled(true));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    axios.get(`${API_URL}/api/reservations`)
      .then((res) => {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        setBookings(res.data.filter((booking) => format(new Date(booking.date), 'yyyy-MM-dd') === dateKey));
      })
      .catch(() => setBookings([]));
  }, [selectedDate]);

  const slotCount = (time) => bookings.filter((booking) => booking.time === time && booking.status !== 'Cancelled').length;
  const isSlotFull = (time) => slotCount(time) >= MAX_TABLES_PER_SLOT;

  const selectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const submitReservation = async (event) => {
    event.preventDefault();

    if (!bookingEnabled) {
      toast.error('Online table booking is currently switched off.');
      return;
    }

    if (isSlotFull(selectedTime)) {
      toast.error('That time has just filled up. Please choose another slot.');
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/reservations`, {
        date: selectedDate,
        time: selectedTime,
        guests,
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        },
        notes: formData.requests,
        status: 'Pending',
      });
      toast.success('Booking request sent. The restaurant will confirm it.');
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setGuests(2);
      setFormData({ name: '', phone: '', email: '', requests: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not book that table. Please try another time.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <button className="btn btn-link text-gold p-0" type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        <i className="fa-solid fa-chevron-left" />
      </button>
      <h2 className="h6 mb-0 fw-bold text-white text-uppercase">{format(currentMonth, 'MMMM yyyy')}</h2>
      <button className="btn btn-link text-gold p-0" type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );

  const renderDays = () => (
    <div className="row text-center mb-2 g-0">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
        <div key={`${day}-${index}`} className="col fw-bold extra-small text-gold opacity-75">{day}</div>
      ))}
    </div>
  );

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i += 1) {
        const cloneDay = day;
        const isPast = isBefore(day, todayNZ);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const inMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toISOString()}
            className={`col p-1 text-center calendar-day ${!inMonth ? 'opacity-10' : ''} ${isPast ? 'text-danger opacity-25 pe-none' : 'cursor-pointer'} ${isSelected ? 'selected-day' : ''}`}
            onClick={() => !isPast && inMonth && selectDate(cloneDay)}
          >
            <div className={`day-number ${isSelected ? 'bg-gold text-dark' : 'bg-soft-dark text-white'} rounded p-2`}>
              {format(day, 'd')}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="row g-1" key={day.toISOString()}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderProgressHeader = () => (
    <div className="d-flex justify-content-center gap-2 mb-4 overflow-auto pb-2">
      {['Date', 'Time', 'People', 'Final'].map((name, index) => (
        <span key={name} className={`reservation-step ${step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''}`}>
          {name}
        </span>
      ))}
    </div>
  );

  const renderTimeButton = (time) => (
    <button
      type="button"
      className={`btn btn-sm py-2 rounded-pill w-100 ${selectedTime === time ? 'btn-warning text-dark shadow-sm' : 'btn-outline-secondary text-light border-secondary border-opacity-25'}`}
      disabled={isSlotFull(time)}
      onClick={() => setSelectedTime(time)}
    >
      {time} {isSlotFull(time) ? 'Full' : `${MAX_TABLES_PER_SLOT - slotCount(time)} left`}
    </button>
  );

  return (
    <div className="section-dark reservation-page">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <p className="eyebrow">Reservations</p>
            <h1>Book one of the few dine-in tables.</h1>
            <p className="lead text-white-50">
              Real-time slot limits help prevent overbooking. Confirmation data is captured for the customer and restaurant team.
            </p>
            {!bookingEnabled && (
              <div className="service-disabled mt-4">
                <i className="fa-solid fa-circle-pause" />
                Online table booking is currently switched off by the restaurant.
              </div>
            )}
            <div className="reservation-info">
              <span><i className="fa-solid fa-location-dot" /> 113 Tongariro Street, Taupo</span>
              <span><i className="fa-solid fa-phone" /> 07 281 7206</span>
              <span><i className="fa-solid fa-users" /> {MAX_TABLES_PER_SLOT} table bookings per time slot</span>
            </div>
          </div>

          <div className="col-lg-6">
            {renderProgressHeader()}
            <div className="booking-card">
              {step === 1 && (
                <>
                  <h2>Select Date</h2>
                  {renderHeader()}
                  {renderDays()}
                  {renderCells()}
                  <button type="button" className="btn btn-warning text-dark fw-bold w-100 py-3 mt-4" disabled={!selectedDate || !bookingEnabled} onClick={() => setStep(2)}>
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>Select Time</h2>
                  <p className="small text-secondary">Showing live capacity for {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'your selected date'}.</p>
                  <h3>Lunch</h3>
                  <div className="time-grid">{lunchTimes.map((time) => <span key={time}>{renderTimeButton(time)}</span>)}</div>
                  <h3 className="mt-4">Dinner</h3>
                  <div className="time-grid">{dinnerTimes.map((time) => <span key={time}>{renderTimeButton(time)}</span>)}</div>
                  <div className="d-flex gap-3 mt-4">
                    <button type="button" className="btn btn-outline-light w-100 py-3" onClick={() => setStep(1)}>Back</button>
                    <button type="button" className="btn btn-warning text-dark fw-bold w-100 py-3" disabled={!selectedTime} onClick={() => setStep(3)}>Next</button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2>Number of People</h2>
                  <div className="guest-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => (
                      <button key={number} type="button" className={guests === number ? 'active' : ''} onClick={() => setGuests(number)}>
                        {number}
                      </button>
                    ))}
                  </div>
                  <div className="d-flex gap-3 mt-4">
                    <button type="button" className="btn btn-outline-light w-100 py-3" onClick={() => setStep(2)}>Back</button>
                    <button type="button" className="btn btn-warning text-dark fw-bold w-100 py-3" onClick={() => setStep(4)}>Next</button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2>Complete Reservation</h2>
                  <div className="summary-box">
                    <span>Date <b>{format(selectedDate, 'EEEE, MMMM d')}</b></span>
                    <span>Time <b>{selectedTime}</b></span>
                    <span>Guests <b>{guests}</b></span>
                  </div>
                  <form className="row g-3" onSubmit={submitReservation}>
                    <div className="col-12">
                      <input className="form-control" required placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <input className="form-control" required placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <input className="form-control" required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <textarea className="form-control" rows="2" placeholder="Requests or dietary notes" value={formData.requests} onChange={(e) => setFormData({ ...formData, requests: e.target.value })} />
                    </div>
                    <div className="col-12 d-flex gap-3">
                      <button type="button" className="btn btn-outline-light w-100 py-3" onClick={() => setStep(3)}>Back</button>
                      <button type="submit" className="btn btn-warning text-dark fw-bold w-100 py-3" disabled={submitting || !bookingEnabled}>
                        {submitting ? 'Booking...' : 'Confirm'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTablePage;
