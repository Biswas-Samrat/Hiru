const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      });
      console.log('MongoDB Connected...');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) {
        console.error('All MongoDB connection attempts failed. Server will stay running but DB operations will fail.');
        console.error('>>> Make sure your current IP is whitelisted in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/');
        return;
      }
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = { connectDB };
