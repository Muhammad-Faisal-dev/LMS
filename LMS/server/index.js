require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

const server = http.createServer(app);
initSocket(server);

module.exports = server;
