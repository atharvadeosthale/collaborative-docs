import { Session } from "@clerk/clerk-sdk-node";
import { Request } from "express";

export type AuthenticatedSocket = {
  socket: Socket;
  userId: string;
};

declare global {
  namespace Express {
    interface Request {
      session: Session;
    }
  }
}
