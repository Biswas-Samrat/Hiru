const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true },
    curryBase: { type: String }, // e.g., Chicken, Beef, Veg (conditional)
    spiceLevel: { 
      type: String, 
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
      default: 'Medium'
    }
  }],
  totalAmount: { type: Number, required: true },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Almost Ready', 'Ready for Pickup', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  estimatedReadyTime: { type: Date },
  actualReadyTime: { type: Date },
  preparationTimer: { type: Number }, // dynamic timer set by admin in minutes
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
