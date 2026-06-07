const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getBookings, createBooking, updateBookingStatus } = require('../controllers/bookingController');

module.exports = (io) => {
  router.get('/', getBookings);
  router.post('/', (req, res) => createBooking(req, res, io));
  router.put('/:id/status', authMiddleware, (req, res) => updateBookingStatus(req, res, io));
  return router;
};
