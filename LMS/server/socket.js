const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

let ioInstance = null;

const getTokenFromHandshake = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  const headerToken = socket.handshake?.headers?.authorization;

  if (authToken) {
    return authToken.startsWith("Bearer ") ? authToken.split(" ")[1] : authToken;
  }

  if (headerToken && headerToken.startsWith("Bearer ")) {
    return headerToken.split(" ")[1];
  }

  return null;
};

const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const token = getTokenFromHandshake(socket);

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id role isApproved name");

      if (!user || !user.isApproved) {
        return next(new Error("User not authorized for socket connection"));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
      };

      return next();
    } catch (error) {
      return next(new Error("Socket authentication failed"));
    }
  });

  ioInstance.on("connection", (socket) => {
    const room = `user:${socket.user.id}`;
    socket.join(room);

    socket.emit("socket:ready", {
      userId: socket.user.id,
      room,
    });

    socket.on("notifications:join", () => {
      socket.join(room);
    });

    socket.on("disconnect", () => {
      socket.leave(room);
    });
  });

  return ioInstance;
};

const getIO = () => ioInstance;

const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
};

const emitToUsers = (userIds = [], event, payloadFactory) => {
  if (!ioInstance) return;

  Array.from(new Set(userIds.map((userId) => String(userId)).filter(Boolean))).forEach(
    (userId) => {
      const payload =
        typeof payloadFactory === "function" ? payloadFactory(userId) : payloadFactory;
      ioInstance.to(`user:${userId}`).emit(event, payload);
    }
  );
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToUsers,
};
