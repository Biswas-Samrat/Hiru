const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const DEFAULT_EMAIL = 'admin@gmail.com';
const DEFAULT_PASSWORD = 'admin@#';

const ensureDefaultAdmin = async () => {
  const count = await Admin.countDocuments();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  await Admin.create({
    email: DEFAULT_EMAIL,
    passwordHash,
  });
  console.log('Default admin account created.');
};

module.exports = { ensureDefaultAdmin, DEFAULT_EMAIL, DEFAULT_PASSWORD };
