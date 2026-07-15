require("dotenv").config();

const http = require("http");
const app = require("../app");
const connectDB = require("../config/db");
const { initSocket } = require("../socket");

connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

if (!global.lmsVercelServer) {
  global.lmsVercelServer = http.createServer(app);
  initSocket(global.lmsVercelServer);
}

module.exports = global.lmsVercelServer;
