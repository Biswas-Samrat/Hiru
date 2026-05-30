const GalleryItem = require('../models/GalleryItem');

const DEFAULT_GALLERY = [
  {
    image: 'https://images.unsplash.com/photo-1585937421612-70a008296fbe?auto=format&fit=crop&w=800&q=80',
    caption: 'Sri Lankan kottu',
    layout: 'hero',
    sortOrder: 0,
  },
  {
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    caption: 'Devilled rice plate',
    layout: 'normal',
    sortOrder: 1,
  },
  {
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    caption: 'Fusion burger',
    layout: 'normal',
    sortOrder: 2,
  },
  {
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    caption: 'Fresh drinks',
    layout: 'normal',
    sortOrder: 3,
  },
  {
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    caption: 'Street food sides',
    layout: 'wide',
    sortOrder: 4,
  },
  {
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    caption: 'Dessert',
    layout: 'normal',
    sortOrder: 5,
  },
];

const ensureDefaultGallery = async () => {
  const count = await GalleryItem.countDocuments();
  if (count > 0) return;

  await GalleryItem.insertMany(DEFAULT_GALLERY);
  console.log('Default gallery images seeded.');
};

module.exports = { ensureDefaultGallery, DEFAULT_GALLERY };
