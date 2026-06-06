const mongoose = require('mongoose');

const orderHistorySchema = new mongoose.Schema(
  {
    originalId: { type: String },
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    customerInfo: { type: Object, required: true },
    status: { type: String, default: 'Completed' },
    estimatedReadyTime: { type: Date },
    actualReadyTime: { type: Date },
    preparationTimer: { type: Number },
    archivedAt: { type: Date, default: Date.now },
    originalCreatedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderHistory', orderHistorySchema);
