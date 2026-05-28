const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

module.exports = (io) => {
  router.get('/', settingsController.getSettings);
  router.put('/', (req, res) => settingsController.updateSettings(req, res, io));
  return router;
};
