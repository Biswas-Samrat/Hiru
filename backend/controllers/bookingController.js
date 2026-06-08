const Reservation = require('../models/Reservation');
const { getOrCreateSettings } = require('./settingsController');
const { sendBookingConfirmationToCustomer, sendBookingNotificationToAdmin } = require('../services/emailService');

const MAX_TABLES_PER_SLOT = Number(process.env.MAX_TABLES_PER_SLOT || 4);

exports.getBookings = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 150, 300);
    const bookings = await Reservation.find()
      .sort({ date: -1, time: 1 })
      .limit(limit)
      .lean();
    res.json(bookings.map((b) => ({ ...b, id: b._id })));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBooking = async (req, res, io) => {
  try {
    const { date, time, customerInfo, notes, guests } = req.body;
    const settings = await getOrCreateSettings();

    if (!settings.onlineBookingEnabled) {
      return res.status(403).json({ success: false, message: 'Online table booking is currently switched off.' });
    }

    const bookingDate = new Date(date);
    const start = new Date(bookingDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(bookingDate);
    end.setHours(23, 59, 59, 999);

    const existingBookings = await Reservation.countDocuments({
      time,
      status: { $ne: 'Cancelled' },
      date: { $gte: start, $lte: end }
    });

    if (existingBookings >= MAX_TABLES_PER_SLOT) {
      return res.status(409).json({ success: false, message: 'That table time is fully booked. Please choose another slot.' });
    }

    // 1. Save to DB first
    const newReservation = new Reservation({
      date: bookingDate,
      time,
      guests,
      customerInfo,
      notes,
      status: 'Pending'
    });
    
    await newReservation.save();

    if (io) {
      io.emit('newReservation', newReservation);
    }

    // 2. Trigger emails asynchronously (non-blocking)
    sendBookingConfirmationToCustomer(newReservation)
      .catch((err) => {
        console.error('✗ Email sending failed: Customer booking confirmation email failed:', err.message);
      });

    sendBookingNotificationToAdmin(newReservation)
      .catch((err) => {
        console.error('✗ Email sending failed: Admin booking notification email failed:', err.message);
      });

    res.status(201).json(newReservation);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res, io) => {
  try {
    const { status } = req.body;
    const booking = await Reservation.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = status;
    await booking.save();
    
    if (io) {
      io.emit('adminReservationUpdate', booking);
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
