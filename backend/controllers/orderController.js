const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { getOrCreateSettings } = require('./settingsController');
const { archiveOrder } = require('./orderHistoryController');

// Core Logic: Live Preparation Timer
const calculateReadyTime = (items) => {
  const maxPrepTime = items.reduce((max, item) => {
    return Math.max(max, item.prepTime || 15);
  }, 15);
  
  const now = new Date();
  return new Date(now.getTime() + maxPrepTime * 60000);
};

exports.getOrders = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 120, 300);
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(orders.map((o) => ({ ...o, id: o._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const ACTIVE_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Almost Ready', 'Ready for Pickup'];

exports.findActiveOrders = async (req, res) => {
  try {
    const { email, phone, orderId } = req.query;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found.' });
      return res.json([order]);
    }

    if (!email && !phone) {
      return res.status(400).json({ message: 'Provide an order ID, email, or phone number.' });
    }

    const query = { status: { $in: ACTIVE_STATUSES } };
    if (email) query['customerInfo.email'] = new RegExp(`^${email.trim()}$`, 'i');
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      query['customerInfo.phone'] = new RegExp(digits.slice(-8));
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(10);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res, io) => {
  try {
    const { items, customerInfo, totalAmount, preparationTimer } = req.body;
    const settings = await getOrCreateSettings();

    if (!settings.onlineOrderingEnabled) {
      return res.status(403).json({ message: 'Online ordering is currently switched off.' });
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one item' });
    }

    if (customerInfo?.fulfillment && customerInfo.fulfillment !== 'pickup') {
      return res.status(400).json({ message: 'This restaurant accepts takeaway pickup orders only.' });
    }

    const mongoose = require('mongoose');
    // Extract menuItem IDs from request items
    const menuItemIds = items
      .map(i => typeof i.menuItem === 'string' ? i.menuItem : i.menuItem?.toString())
      .filter(Boolean);
    // Keep only valid ObjectId strings to avoid Mongoose cast errors
    const validIds = menuItemIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const dbMenuItems = validIds.length
      ? await MenuItem.find({ _id: { $in: validIds } })
      : [];

    const sourceItems = dbMenuItems.length ? dbMenuItems : items;
    const prepMinutes = preparationTimer || Math.max(...sourceItems.map(item => Number(item.prepTime || 15)), 15);
    const readyTime = calculateReadyTime([{ prepTime: prepMinutes }]);
    
    const newOrder = new Order({
      items,
      customerInfo: {
        ...customerInfo,
        fulfillment: 'pickup',
      },
      totalAmount,
      estimatedReadyTime: readyTime,
      preparationTimer: prepMinutes,
      status: 'Pending'
    });

    await newOrder.save();
    
    // Emit event to admin dashboard
    io.emit('newOrder', newOrder);
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res, io) => {
  try {
    const { status, preparationTimer } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (status) {
      order.status = status;
    }
    
    if (preparationTimer) {
      order.preparationTimer = preparationTimer;
      const now = new Date();
      order.estimatedReadyTime = new Date(now.getTime() + preparationTimer * 60000);
    }
    
    if (status === 'Ready for Pickup') {
      order.actualReadyTime = new Date();
    }
    
    await order.save();

    // Auto-archive when order is collected (Completed)
    if (status === 'Completed') {
      await archiveOrder(order);
    }
    
    // Notify client via socket room
    io.to(order._id.toString()).emit('orderUpdate', order);
    // Also notify general admin list
    io.emit('adminOrderUpdate', order);
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
