const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getReservations, createReservation, updateReservationStatus } = require('../controllers/reservationController');

module.exports = (io) => {
  router.get('/', getReservations);
  router.post('/', (req, res) => createReservation(req, res, io));
  router.put('/:id/status', authMiddleware, (req, res) => updateReservationStatus(req, res, io));
  return router;
};
