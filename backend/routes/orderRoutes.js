const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

module.exports = (io) => {
  router.get('/', orderController.getOrders);
  router.post('/', (req, res) => orderController.createOrder(req, res, io));
  router.put('/:id/status', (req, res) => orderController.updateOrderStatus(req, res, io));
  router.get('/:id', orderController.getOrderById);
  return router;
};
