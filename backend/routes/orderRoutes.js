const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

module.exports = (io) => {
  router.get('/', authMiddleware, orderController.getOrders);
  router.get('/track/active', orderController.findActiveOrders);
  router.post('/', (req, res) => orderController.createOrder(req, res, io));
  router.put('/:id/status', authMiddleware, (req, res) => orderController.updateOrderStatus(req, res, io));
  router.get('/:id', orderController.getOrderById);
  return router;
};
