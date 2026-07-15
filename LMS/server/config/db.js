const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection.readyState === 1;
  }

  try {
    connectionPromise = mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/LMS",
      {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      },
    );

    const conn = await connectionPromise;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("Please make sure MongoDB is installed and running");
    return false;
  } finally {
    connectionPromise = null;
  }
};

module.exports = connectDB;
