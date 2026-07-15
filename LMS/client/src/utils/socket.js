import { io } from "socket.io-client";

let socketInstance = null;
let cachedToken = null;

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  return window.location.origin;
};

const getSocketPath = () => import.meta.env.VITE_SOCKET_PATH || "/socket.io";

export const getSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  if (socketInstance && cachedToken === token) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  cachedToken = token;
  socketInstance = io(getSocketUrl(), {
    path: getSocketPath(),
    transports: ["websocket"],
    auth: {
      token,
    },
    autoConnect: true,
    withCredentials: true,
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    cachedToken = null;
  }
};
