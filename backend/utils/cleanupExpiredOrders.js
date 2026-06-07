/**
 * cleanupExpiredOrders.js
 *
 * Scans for orders that have been stuck in PENDING_STRIPE for more than
 * EXPIRY_MINUTES minutes and marks them as PAYMENT_EXPIRED.
 *
 * Called once on server startup; runs every POLL_INTERVAL_MS thereafter.
 */

const Order = require('../models/Order');

const EXPIRY_MINUTES = 30;           // abandon threshold
const POLL_INTERVAL_MS = 5 * 60 * 1000; // check every 5 minutes

const cleanupExpiredOrders = async () => {
  try {
    const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

    // Find all orders still PENDING_STRIPE that were created before the cutoff
    const expiredOrders = await Order.find({
      'customerInfo.paymentStatus': 'PENDING_STRIPE',
      createdAt: { $lt: cutoff },
    });

    if (expiredOrders.length === 0) return;

    const ids = expiredOrders.map((o) => o._id);

    await Order.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          'customerInfo.paymentStatus': 'PAYMENT_EXPIRED',
          status: 'Cancelled',
        },
      },
    );

    console.log(
      `🧹 Expired ${expiredOrders.length} abandoned PENDING_STRIPE order(s): [${ids.join(', ')}]`,
    );
  } catch (err) {
    console.error('✗ Error during expired-order cleanup:', err.message);
  }
};

/**
 * Call this once during server startup.
 * Runs an immediate sweep then schedules recurring cleanup.
 */
const startExpiredOrderCleanup = () => {
  // Run immediately so stale orders from a previous server run are cleared
  cleanupExpiredOrders();

  // Then repeat on a schedule
  setInterval(cleanupExpiredOrders, POLL_INTERVAL_MS);

  console.log(
    `⏱  Abandoned-payment cleanup scheduled (every ${POLL_INTERVAL_MS / 60000} min, expiry after ${EXPIRY_MINUTES} min)`,
  );
};

module.exports = { startExpiredOrderCleanup, cleanupExpiredOrders };
