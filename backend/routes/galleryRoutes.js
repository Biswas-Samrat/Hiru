const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const galleryController = require('../controllers/galleryController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed.'));
      return;
    }
    cb(null, true);
  },
});

router.get('/', galleryController.getGalleryItems);
router.post('/upload', authMiddleware, upload.single('image'), galleryController.uploadGalleryImage);
router.post('/', authMiddleware, galleryController.createGalleryItem);
router.put('/reorder', authMiddleware, galleryController.reorderGallery);
router.put('/:id', authMiddleware, galleryController.updateGalleryItem);
router.delete('/:id', authMiddleware, galleryController.deleteGalleryItem);

module.exports = router;
