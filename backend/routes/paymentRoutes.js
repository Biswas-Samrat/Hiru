const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

module.exports = (io) => {
  // New: embedded Payment Element flow — returns { clientSecret, orderId }
  router.post('/create-payment-intent', paymentController.createPaymentIntent);

  // Legacy: Stripe Checkout Session redirect flow (kept for backwards compatibility)
  router.post('/create-checkout-session', paymentController.createCheckoutSession);

  return router;
};
