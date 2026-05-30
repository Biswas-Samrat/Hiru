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
import SorryDialog from '../components/SorryDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const nzTimeZone = 'Pacific/Auckland';
const MAX_TABLES_PER_SLOT = 4;

const inputLight =
  'w-full min-h-12 rounded-lg border border-gray-200 bg-surface px-3 text-ink placeholder:text-muted focus:border-gold focus:outline-none';

const BookTablePage = () => {
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guests, setGuests] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [showSorryDialog, setShowSorryDialog] = useState(false);
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
      setShowSorryDialog(true);
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
      if (error.response?.status === 403) {
        setShowSorryDialog(true);
      } else {
        toast.error(error.response?.data?.message || 'Could not book that table. Please try another time.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <div className="mb-3 flex items-center justify-between">
      <button className="p-0 text-gold hover:text-gold-bright" type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        <i className="fa-solid fa-chevron-left" />
      </button>
      <h2 className="mb-0 text-sm font-bold uppercase text-ink">{format(currentMonth, 'MMMM yyyy')}</h2>
      <button className="p-0 text-gold hover:text-gold-bright" type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );

  const renderDays = () => (
    <div className="mb-2 grid grid-cols-7 text-center">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
        <div key={`${day}-${index}`} className="text-[10px] font-bold uppercase text-gold/75">{day}</div>
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
            className={`p-1 text-center ${!inMonth ? 'opacity-10' : ''} ${
              isPast ? 'pointer-events-none text-red-400/50 opacity-25' : 'cursor-pointer'
            }`}
            onClick={() => !isPast && inMonth && selectDate(cloneDay)}
          >
            <div
              className={`rounded p-2 ${
                isSelected ? 'bg-gold font-bold text-white' : 'bg-surface text-ink hover:bg-gold/10'
              }`}
            >
              {format(day, 'd')}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="mb-1 grid grid-cols-7 gap-0" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderProgressHeader = () => (
    <div className="mb-4 flex justify-center gap-2 overflow-auto pb-2">
      {['Date', 'Time', 'People', 'Final'].map((name, index) => (
        <span
          key={name}
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
            step === index + 1
              ? 'border-gold bg-gold text-[#0b0b0b]'
              : step > index + 1
                ? 'border-gold/50 bg-gold/20 text-gold'
                : 'border-gray-200 text-muted'
          }`}
        >
          {name}
        </span>
      ))}
    </div>
  );

  const renderTimeButton = (time) => (
    <button
      type="button"
      className={`w-full rounded-full px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selectedTime === time
          ? 'bg-amber-400 text-black shadow-sm'
          : 'border border-gray-200 text-ink hover:border-gold/50'
      }`}
      disabled={isSlotFull(time)}
      onClick={() => setSelectedTime(time)}
    >
      {time} {isSlotFull(time) ? 'Full' : `${MAX_TABLES_PER_SLOT - slotCount(time)} left`}
    </button>
  );

  return (
    <div className="bg-cream pb-24 pt-28">
      <SorryDialog
        open={showSorryDialog}
        onClose={() => setShowSorryDialog(false)}
        title="Sorry — no tables available to book online"
        message="We are not accepting online table bookings at the moment. Please call us on 07 281 7206 to check walk-in availability."
      />
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-royal text-xs font-bold uppercase tracking-widest text-gold">Reservations</p>
            <h1 className="mb-4 text-3xl font-bold text-ink md:text-4xl">Book one of the few dine-in tables</h1>
            <p className="mb-6 text-lg text-muted">
              Real-time slot limits help prevent overbooking. Confirmation data is captured for the customer and restaurant team.
            </p>
            <div className="flex flex-col gap-3 text-sm text-muted">
              <span><i className="fa-solid fa-location-dot me-2 text-gold" /> 113 Tongariro Street, Taupo</span>
              <span><i className="fa-solid fa-phone me-2 text-gold" /> 07 281 7206</span>
              <span><i className="fa-solid fa-users me-2 text-gold" /> {MAX_TABLES_PER_SLOT} table bookings per time slot</span>
            </div>
          </div>

          <div>
            {renderProgressHeader()}
            <div className="card-light p-6">
              {step === 1 && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-ink">Select date</h2>
                  {renderHeader()}
                  {renderDays()}
                  {renderCells()}
                  <button
                    type="button"
                    className="mt-4 w-full rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedDate}
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="mb-2 text-xl font-bold text-ink">Select time</h2>
                  <p className="mb-4 text-sm text-muted">
                    Showing live capacity for {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'your selected date'}.
                  </p>
                  <h3 className="mb-2 font-semibold text-gold">Lunch</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {lunchTimes.map((time) => (
                      <span key={time}>{renderTimeButton(time)}</span>
                    ))}
                  </div>
                  <h3 className="mb-2 mt-4 font-semibold text-gold">Dinner</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {dinnerTimes.map((time) => (
                      <span key={time}>{renderTimeButton(time)}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      className="btn-outline w-full py-3"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!selectedTime}
                      onClick={() => setStep(3)}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-ink">Number of people</h2>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => (
                      <button
                        key={number}
                        type="button"
                        className={`rounded-lg border py-3 font-bold transition-colors ${
                          guests === number
                            ? 'border-gold bg-gold text-white'
                            : 'border-gray-200 text-ink hover:border-gold/50'
                        }`}
                        onClick={() => setGuests(number)}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      className="btn-outline w-full py-3"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300"
                      onClick={() => setStep(4)}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-ink">Complete reservation</h2>
                  <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-surface p-4 text-sm">
                    <div className="flex justify-between text-muted">
                      <span>Date</span>
                      <b className="text-ink">{format(selectedDate, 'EEEE, MMMM d')}</b>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Time</span>
                      <b className="text-ink">{selectedTime}</b>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Guests</span>
                      <b className="text-ink">{guests}</b>
                    </div>
                  </div>
                  <form className="space-y-3" onSubmit={submitReservation}>
                    <input
                      className={inputLight}
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className={inputLight}
                        required
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      <input
                        className={inputLight}
                        required
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <textarea
                      className={`${inputLight} min-h-[5rem] resize-y`}
                      rows="2"
                      placeholder="Requests or dietary notes"
                      value={formData.requests}
                      onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        className="btn-outline w-full py-3"
                        onClick={() => setStep(3)}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-full rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin me-2" />
                            Booking...
                          </>
                        ) : (
                          'Confirm'
                        )}
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
