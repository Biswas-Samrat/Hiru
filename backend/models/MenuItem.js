const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Kottu', 'Rice', 'Burgers', 'Fusion'] 
  },
  isVegetarian: { type: Boolean, default: false },
  isSpicy: { type: Boolean, default: false },
  image: { type: String }, // URL to image
  isOutOfStock: { type: Boolean, default: false },
  prepTime: { type: Number, default: 15 }, // default prep time in minutes
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
