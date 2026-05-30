const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    caption: { type: String, default: '' },
    layout: {
      type: String,
      enum: ['hero', 'wide', 'normal'],
      default: 'normal',
    },
    sortOrder: { type: Number, default: 0 },
    cloudinaryPublicId: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
