const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ctrl = require('../controllers/reservationHistoryController');

router.get('/', authMiddleware, ctrl.getReservationHistory);
router.post('/:id/move', authMiddleware, ctrl.moveToHistory);
router.delete('/all', authMiddleware, ctrl.deleteAllReservationHistory);
router.delete('/:id', authMiddleware, ctrl.deleteReservationHistory);

module.exports = router;
