const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const { getUploadFilePath } = require("./utils/upload");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/uploads/:filename", (req, res) => {
  const filePath = getUploadFilePath(req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: "File not found",
    });
  }

  return res.sendFile(filePath);
});

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

module.exports = app;
