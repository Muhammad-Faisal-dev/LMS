const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/LMS",
      {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("Please make sure MongoDB is installed and running");
    return false;
  }
};

module.exports = connectDB;
