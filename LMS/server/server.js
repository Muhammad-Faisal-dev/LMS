// Load environment variables first
require("dotenv").config();

// Core imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/upload", require("./routes/upload"));

// Test route
app.get("/", (req, res) => {
  res.send("📚 LMS API is running");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3500;
console.log("PORT from .env:", process.env.PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
