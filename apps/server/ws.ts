import { Server } from "socket.io";

export const setupWebSocket = (io: Server) => {
  io.on("connect", (socket) => {
    console.log(`New connection: ${socket.id}`);
  });
};
