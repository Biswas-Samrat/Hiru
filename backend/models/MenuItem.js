const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    isVegetarian: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    spicyLevel: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    image: { type: String },
    isOutOfStock: { type: Boolean, default: false },
    prepTime: { type: Number, default: 15 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
