const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (STRIPE_SECRET_KEY) {
  console.log(`[stripe] ✓ STRIPE_SECRET_KEY is loaded (starts with ${STRIPE_SECRET_KEY.slice(0, 7)}...)`);
} else {
  console.error('[stripe] ✗ STRIPE_SECRET_KEY is not loaded in process.env!');
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);
const Order = require('../models/Order');

const WEBHOOK_SETTLEABLE_STATUSES = ['PENDING_STRIPE', 'PAYMENT_FAILED'];

const log = (message, meta = {}) => {
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[payments] ${message}${details}`);
};

const logError = (message, error, meta = {}) => {
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const stripeType = error?.type ? ` (type: ${error.type})` : '';
  console.error(`[payments] ✗ ${message}: ${error?.message || error}${stripeType}${details}`);
};

const emitOrderUpdates = (io, order, { newSuccessfulOrder = false } = {}) => {
  if (!io || !order) return;

  if (newSuccessfulOrder) {
    io.emit('newOrder', order);
  }

  io.emit('adminOrderUpdate', order);
  io.to(order._id.toString()).emit('orderUpdate', order);
};

const sendSuccessfulOrderEmails = (order, source) => {
  const {
    sendOrderConfirmationToCustomer,
    sendOrderNotificationToAdmin,
  } = require('../services/emailService');

  const orderId = order._id?.toString();

  // ── Customer confirmation ────────────────────────────────────────────────
  log('Sending customer order confirmation email (non-blocking)', {
    orderId,
    to: order.customerInfo?.email,
    source,
  });
  sendOrderConfirmationToCustomer(order)
    .then(() => log('Customer order confirmation email complete', { orderId }))
    .catch((emailErr) => {
      logError('Customer order confirmation email failed', emailErr, { orderId, source });
    });

  // ── Admin notification ───────────────────────────────────────────────────
  log('Sending admin order notification email (non-blocking)', {
    orderId,
    to: process.env.ADMIN_EMAIL || 'samrat.tx@gmail.com',
    source,
  });
  sendOrderNotificationToAdmin(order)
    .then(() => log('Admin order notification email complete', { orderId }))
    .catch((emailErr) => {
      logError('Admin order notification email failed', emailErr, { orderId, source });
    });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, customerInfo, totalAmount, preparationTimer } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !customerInfo || !totalAmount) {
      return res.status(400).json({
        error: 'Missing required order fields: items, customerInfo, totalAmount',
      });
    }

    const prepMinutes = preparationTimer || 15;
    const readyTime = new Date(Date.now() + prepMinutes * 60000);

    const order = new Order({
      items,
      customerInfo: {
        ...customerInfo,
        fulfillment: 'pickup',
        paymentMethod: 'online',
        paymentStatus: 'PENDING_STRIPE',
        stripePaymentStatus: 'requires_payment_method',
        processedStripeEventIds: [],
      },
      totalAmount,
      estimatedReadyTime: readyTime,
      preparationTimer: prepMinutes,
      status: 'Pending',
    });

    await order.save();
    log('Order created for online payment', {
      orderId: order._id.toString(),
      amount: totalAmount,
      email: order.customerInfo?.email,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(totalAmount) * 100),
      currency: 'nzd',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order._id.toString() },
    });

    order.customerInfo.stripePaymentIntentId = paymentIntent.id;
    order.customerInfo.stripePaymentStatus = paymentIntent.status;
    order.markModified('customerInfo');
    await order.save();

    log('PaymentIntent created', {
      orderId: order._id.toString(),
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id.toString(),
    });
  } catch (error) {
    logError('Error creating PaymentIntent', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, customerInfo, totalAmount, preparationTimer } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !customerInfo || !totalAmount) {
      return res.status(400).json({ error: 'Missing required order fields: items, customerInfo, totalAmount' });
    }

    const prepMinutes = preparationTimer || 15;
    const readyTime = new Date(Date.now() + prepMinutes * 60000);

    const order = new Order({
      items,
      customerInfo: {
        ...customerInfo,
        fulfillment: 'pickup',
        paymentMethod: 'online',
        paymentStatus: 'PENDING_STRIPE',
        processedStripeEventIds: [],
      },
      totalAmount,
      estimatedReadyTime: readyTime,
      preparationTimer: prepMinutes,
      status: 'Pending',
    });

    await order.save();

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'nzd',
        product_data: { name: item.itemName || item.name || 'Menu Item' },
        unit_amount: Math.round(Number(item.price || item.unitPrice || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      metadata: { orderId: order._id.toString() },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking/${order._id}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart?cancelled=true`,
    });

    order.customerInfo.stripeSessionId = session.id;
    order.markModified('customerInfo');
    await order.save();

    log('Checkout Session created', {
      orderId: order._id.toString(),
      sessionId: session.id,
    });
    res.json({ url: session.url, orderId: order._id });
  } catch (error) {
    logError('Error creating Checkout Session', error);
    res.status(500).json({ error: error.message });
  }
};

const markOrderPaid = async ({ orderId, event, paymentIntentId, sessionId, io }) => {
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      'customerInfo.paymentMethod': 'online',
      'customerInfo.paymentStatus': { $in: WEBHOOK_SETTLEABLE_STATUSES },
      'customerInfo.processedStripeEventIds': { $ne: event.id },
    },
    {
      $set: {
        'customerInfo.paymentStatus': 'PAID',
        'customerInfo.stripePaymentStatus': 'paid',
        'customerInfo.stripePaidAt': new Date(),
        ...(paymentIntentId ? { 'customerInfo.stripePaymentIntentId': paymentIntentId } : {}),
        ...(sessionId ? { 'customerInfo.stripeSessionId': sessionId } : {}),
      },
      $addToSet: {
        'customerInfo.processedStripeEventIds': event.id,
      },
    },
    { new: true },
  );

  if (!updatedOrder) {
    const current = await Order.findById(orderId).lean();
    log('Payment success skipped by idempotency/status guard', {
      orderId,
      eventId: event.id,
      currentPaymentStatus: current?.customerInfo?.paymentStatus,
    });
    return;
  }

  log('Order marked PAID from webhook', {
    orderId,
    eventId: event.id,
    paymentIntentId,
    sessionId,
  });

  emitOrderUpdates(io, updatedOrder, { newSuccessfulOrder: true });

  // Individual email errors are caught inside sendSuccessfulOrderEmails — no extra try/catch needed
  sendSuccessfulOrderEmails(updatedOrder, event.type);
  log('Order email dispatch completed', { orderId, eventId: event.id });
};

const markOrderPaymentFailed = async ({ orderId, event, paymentIntentId, reason, io }) => {
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      'customerInfo.paymentMethod': 'online',
      'customerInfo.paymentStatus': { $ne: 'PAID' },
      'customerInfo.processedStripeEventIds': { $ne: event.id },
    },
    {
      $set: {
        'customerInfo.paymentStatus': 'PAYMENT_FAILED',
        'customerInfo.stripePaymentStatus': 'payment_failed',
        'customerInfo.stripeFailureReason': reason || 'Payment declined',
        ...(paymentIntentId ? { 'customerInfo.stripePaymentIntentId': paymentIntentId } : {}),
      },
      $addToSet: {
        'customerInfo.processedStripeEventIds': event.id,
      },
    },
    { new: true },
  );

  if (!updatedOrder) {
    const current = await Order.findById(orderId).lean();
    log('Payment failure skipped by idempotency/status guard', {
      orderId,
      eventId: event.id,
      currentPaymentStatus: current?.customerInfo?.paymentStatus,
    });
    return;
  }

  log('Order marked PAYMENT_FAILED from webhook', {
    orderId,
    eventId: event.id,
    paymentIntentId,
    reason,
  });

  emitOrderUpdates(io, updatedOrder);
};

exports.handleWebhook = async (req, res, io) => {
  const sig = req.headers['stripe-signature'];
  let event;

  log('Webhook received', {
    route: req.originalUrl,
    hasSignature: Boolean(sig),
    bytes: Buffer.isBuffer(req.body) ? req.body.length : undefined,
  });

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logError('Webhook verification cannot run', 'STRIPE_WEBHOOK_SECRET is missing');
    return res.status(500).send('Webhook configuration error');
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    log('Webhook verification succeeded', { eventId: event.id, eventType: event.type });
  } catch (err) {
    logError('Webhook verification failed', err, { route: req.originalUrl });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        log('Handling payment_intent.succeeded', {
          eventId: event.id,
          paymentIntentId: pi.id,
          orderId,
        });

        if (orderId) {
          await markOrderPaid({ orderId, event, paymentIntentId: pi.id, io });
        } else {
          log('payment_intent.succeeded missing orderId metadata', { eventId: event.id, paymentIntentId: pi.id });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        const reason = pi.last_payment_error?.message || 'Payment declined';
        log('Handling payment_intent.payment_failed', {
          eventId: event.id,
          paymentIntentId: pi.id,
          orderId,
          reason,
        });

        if (orderId) {
          await markOrderPaymentFailed({ orderId, event, paymentIntentId: pi.id, reason, io });
        } else {
          log('payment_intent.payment_failed missing orderId metadata', { eventId: event.id, paymentIntentId: pi.id });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        log('Handling checkout.session.completed', {
          eventId: event.id,
          sessionId: session.id,
          orderId,
        });

        if (orderId) {
          await markOrderPaid({ orderId, event, sessionId: session.id, io });
        } else {
          log('checkout.session.completed missing orderId metadata', { eventId: event.id, sessionId: session.id });
        }
        break;
      }

      default:
        log('Webhook event ignored', { eventId: event.id, eventType: event.type });
    }

    res.json({ received: true });
  } catch (err) {
    logError('Webhook processing failed', err, { eventId: event.id, eventType: event.type });
    res.status(500).send('Webhook processing failed');
  }
};
