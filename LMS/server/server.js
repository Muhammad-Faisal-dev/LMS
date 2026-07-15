require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const createHttpServer = () => {
  if (!global.lmsHttpServer) {
    global.lmsHttpServer = http.createServer(app);
    initSocket(global.lmsHttpServer);
  }

  return global.lmsHttpServer;
};

const server = createHttpServer();

connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = server;
