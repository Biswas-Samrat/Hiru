const MenuItem = require('../models/MenuItem');

const listImage = (image) => {
  if (!image) return '';
  const value = String(image);
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return '';
};

exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find()
      .sort({ category: 1, name: 1 })
      .select('name description price category image isVegetarian isSpicy spicyLevel isFeatured isAvailable isOutOfStock prepTime createdAt updatedAt')
      .lean();

    const payload = items.map((item) => ({
      ...item,
      id: item._id,
      image: listImage(item.image),
    }));
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ ...item, id: item._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      isOutOfStock: req.body.isAvailable === false || req.body.isOutOfStock === true,
      isAvailable: req.body.isAvailable !== false && req.body.isOutOfStock !== true,
      spicyLevel: Number(req.body.spicyLevel || 0),
      prepTime: Number(req.body.prepTime || 15),
      price: Number(req.body.price || 0),
    };
    const newItem = new MenuItem(payload);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const payload = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(payload, 'isAvailable')) {
      payload.isOutOfStock = !payload.isAvailable;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'isOutOfStock')) {
      payload.isAvailable = !payload.isOutOfStock;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'spicyLevel')) {
      payload.spicyLevel = Number(payload.spicyLevel || 0);
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'prepTime')) {
      payload.prepTime = Number(payload.prepTime || 15);
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'price')) {
      payload.price = Number(payload.price || 0);
    }

    Object.assign(item, payload);
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
