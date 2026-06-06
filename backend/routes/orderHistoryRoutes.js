const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ctrl = require('../controllers/orderHistoryController');

router.get('/', authMiddleware, ctrl.getOrderHistory);
router.delete('/all', authMiddleware, ctrl.deleteAllOrderHistory);
router.delete('/:id', authMiddleware, ctrl.deleteOrderHistory);

module.exports = router;
