const cloudinary = require('cloudinary').v2;
const GalleryItem = require('../models/GalleryItem');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toResponse = (item) => ({
  id: item._id,
  image: item.image,
  caption: item.caption,
  layout: item.layout,
  sortOrder: item.sortOrder,
  isActive: item.isActive,
});

exports.getGalleryItems = async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { isActive: true };
    const items = await GalleryItem.find(query).sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(items.map((item) => ({ ...toResponse(item), id: item._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGalleryItem = async (req, res) => {
  try {
    const { image, caption, layout, sortOrder } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image URL is required.' });
    }

    const maxOrder = await GalleryItem.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
    const item = new GalleryItem({
      image,
      caption: caption || '',
      layout: ['hero', 'wide', 'normal'].includes(layout) ? layout : 'normal',
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : (maxOrder?.sortOrder ?? -1) + 1,
      cloudinaryPublicId: req.body.cloudinaryPublicId || '',
    });
    await item.save();
    res.status(201).json(toResponse(item));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Gallery item not found.' });

    if (req.body.image) item.image = req.body.image;
    if (req.body.caption !== undefined) item.caption = req.body.caption;
    if (req.body.layout && ['hero', 'wide', 'normal'].includes(req.body.layout)) {
      item.layout = req.body.layout;
    }
    if (req.body.sortOrder !== undefined) item.sortOrder = Number(req.body.sortOrder);
    if (req.body.isActive !== undefined) item.isActive = Boolean(req.body.isActive);
    if (req.body.cloudinaryPublicId) item.cloudinaryPublicId = req.body.cloudinaryPublicId;

    await item.save();
    res.json(toResponse(item));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Gallery item not found.' });

    if (item.cloudinaryPublicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(item.cloudinaryPublicId);
      } catch {
        /* ignore cloudinary delete errors */
      }
    }

    res.json({ message: 'Gallery item deleted.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.reorderGallery = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds array is required.' });
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        GalleryItem.findByIdAndUpdate(id, { sortOrder: index })
      )
    );

    const items = await GalleryItem.find().sort({ sortOrder: 1 }).lean();
    res.json(items.map((item) => ({ ...toResponse(item), id: item._id })));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'hiru-gallery', resource_type: 'image' },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Image upload failed.' });
  }
};
