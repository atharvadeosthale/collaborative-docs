import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupExpressServer } from "./http";
import { setupWebSocket } from "./ws";
import cors from "cors";

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

setupExpressServer(app);
setupWebSocket(io);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
