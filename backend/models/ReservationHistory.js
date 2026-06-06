const mongoose = require('mongoose');

const reservationHistorySchema = new mongoose.Schema(
  {
    originalId: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    customerInfo: { type: Object, required: true },
    status: { type: String },
    notes: { type: String },
    archivedAt: { type: Date, default: Date.now },
    originalCreatedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReservationHistory', reservationHistorySchema);
