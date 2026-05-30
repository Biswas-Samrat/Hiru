const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const signToken = (admin) =>
  jwt.sign(
    { id: admin._id.toString(), email: admin.email },
    process.env.JWT_SECRET || 'hiru-admin-secret',
    { expiresIn: '7d' }
  );

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: signToken(admin),
      email: admin.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json({ email: req.admin.email });
};

exports.updateCredentials = async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    const valid = await bcrypt.compare(currentPassword || '', admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    if (newEmail) {
      const email = newEmail.toLowerCase().trim();
      const exists = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (exists) {
        return res.status(409).json({ message: 'That email is already in use.' });
      }
      admin.email = email;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }
      admin.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();
    res.json({
      message: 'Credentials updated successfully.',
      email: admin.email,
      token: signToken(admin),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
