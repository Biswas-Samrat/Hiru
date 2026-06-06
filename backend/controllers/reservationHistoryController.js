const Reservation = require('../models/Reservation');
const ReservationHistory = require('../models/ReservationHistory');

// GET all reservation history
exports.getReservationHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 300, 500);
    const history = await ReservationHistory.find()
      .sort({ archivedAt: -1 })
      .limit(limit)
      .lean();
    res.json(history.map((r) => ({ ...r, id: r._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Move a reservation to history (and remove from active reservations)
exports.moveToHistory = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    const existing = await ReservationHistory.findOne({ originalId: String(reservation._id) });
    if (!existing) {
      const record = new ReservationHistory({
        originalId: String(reservation._id),
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        customerInfo: reservation.customerInfo,
        status: reservation.status,
        notes: reservation.notes,
        originalCreatedAt: reservation.createdAt,
      });
      await record.save();
    }

    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Moved to history' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE single reservation history record
exports.deleteReservationHistory = async (req, res) => {
  try {
    const deleted = await ReservationHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE all reservation history records
exports.deleteAllReservationHistory = async (req, res) => {
  try {
    await ReservationHistory.deleteMany({});
    res.json({ message: 'All reservation history deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
