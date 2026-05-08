const express = require('express');
const router = express.Router();
const { getReservations, createReservation, updateReservationStatus } = require('../controllers/reservationController');

router.get('/', getReservations);
router.post('/', createReservation);
router.put('/:id/status', updateReservationStatus);

module.exports = router;
