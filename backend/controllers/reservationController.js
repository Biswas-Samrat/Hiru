const Reservation = require('../models/Reservation');
const { getOrCreateSettings } = require('./settingsController');

const MAX_TABLES_PER_SLOT = Number(process.env.MAX_TABLES_PER_SLOT || 4);

exports.getReservations = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 150, 300);
    const reservations = await Reservation.find()
      .sort({ date: -1, time: 1 })
      .limit(limit)
      .lean();
    res.json(reservations.map((r) => ({ ...r, id: r._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReservation = async (req, res, io) => {
  try {
    const { date, time } = req.body;
    const settings = await getOrCreateSettings();

    if (!settings.onlineBookingEnabled) {
      return res.status(403).json({ message: 'Online table booking is currently switched off.' });
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
      return res.status(409).json({ message: 'That table time is fully booked. Please choose another slot.' });
    }

    const newReservation = new Reservation(req.body);
    await newReservation.save();
    io.emit('newReservation', newReservation);
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReservationStatus = async (req, res, io) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    reservation.status = status;
    await reservation.save();
    io.emit('adminReservationUpdate', reservation);
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
