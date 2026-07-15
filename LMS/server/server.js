require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/upload", require("./routes/upload"));

app.get("/", (req, res) => {
  res.send("📚 LMS API is running");
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
