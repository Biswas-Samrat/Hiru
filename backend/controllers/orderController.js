const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Core Logic: Live Preparation Timer
const calculateReadyTime = (items) => {
  // Simple logic: sum of prep times or max prep time + buffer
  // Here we use max prep time of items in the order + some overhead
  const maxPrepTime = items.reduce((max, item) => {
    return Math.max(max, item.prepTime || 15);
  }, 0);
  
  const now = new Date();
  return new Date(now.getTime() + maxPrepTime * 60000);
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.menuItem').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res, io) => {
  try {
    const { items, customerInfo, totalAmount } = req.body;
    
    // Fetch menu items to get prep times
    const menuItemIds = items.map(i => i.menuItem);
    const dbMenuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
    
    const readyTime = calculateReadyTime(dbMenuItems);
    
    const newOrder = new Order({
      items,
      customerInfo,
      totalAmount,
      estimatedReadyTime: readyTime,
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
    
    order.status = status;
    if (preparationTimer) {
      order.preparationTimer = preparationTimer;
      // Update estimated ready time based on dynamic timer from admin
      const now = new Date();
      order.estimatedReadyTime = new Date(now.getTime() + preparationTimer * 60000);
    }
    
    if (status === 'Ready for Pickup') {
      order.actualReadyTime = new Date();
    }
    
    await order.save();
    
    // Notify client via socket room
    io.to(order._id.toString()).emit('orderUpdate', order);
    // Also notify general admin list
    io.emit('adminOrderUpdate', order);
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
