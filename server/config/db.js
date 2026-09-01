const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string in MONGO_URI.
 * Exits the process on failure so the app never runs against a broken DB connection.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
