import { io } from "socket.io-client";
import { API_BASE_URL } from "./apiClient";

let socket = null;

export const connectSocket = (token) => {
  if (!token) return null;
  
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_BASE_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
