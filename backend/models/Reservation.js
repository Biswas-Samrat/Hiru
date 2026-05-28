const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    customerInfo: { type: Object, required: true },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Pending'],
      default: 'Pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
