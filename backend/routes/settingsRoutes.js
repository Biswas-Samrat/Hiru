const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

module.exports = (io) => {
  router.get('/', settingsController.getSettings);
  const authMiddleware = require('../middleware/authMiddleware');
  router.put('/', authMiddleware, (req, res) => settingsController.updateSettings(req, res, io));
  return router;
};
