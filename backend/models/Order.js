const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    customerInfo: { type: Object, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Preparing', 'Almost Ready', 'Ready for Pickup', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    estimatedReadyTime: { type: Date },
    actualReadyTime: { type: Date },
    preparationTimer: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
