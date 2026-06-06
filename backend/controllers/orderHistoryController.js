const OrderHistory = require('../models/OrderHistory');

// GET all order history
exports.getOrderHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 300, 500);
    const history = await OrderHistory.find()
      .sort({ archivedAt: -1 })
      .limit(limit)
      .lean();
    res.json(history.map((o) => ({ ...o, id: o._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE single order history record
exports.deleteOrderHistory = async (req, res) => {
  try {
    const deleted = await OrderHistory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE all order history records
exports.deleteAllOrderHistory = async (req, res) => {
  try {
    await OrderHistory.deleteMany({});
    res.json({ message: 'All order history deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal helper — called automatically when an order is marked Completed
exports.archiveOrder = async (order) => {
  try {
    const existing = await OrderHistory.findOne({ originalId: String(order._id || order.id) });
    if (existing) return; // already archived

    const record = new OrderHistory({
      originalId: String(order._id || order.id),
      items: order.items,
      totalAmount: order.totalAmount,
      customerInfo: order.customerInfo,
      status: order.status,
      estimatedReadyTime: order.estimatedReadyTime,
      actualReadyTime: order.actualReadyTime,
      preparationTimer: order.preparationTimer,
      originalCreatedAt: order.createdAt,
    });
    await record.save();
  } catch (err) {
    console.error('Failed to archive order:', err.message);
  }
};
