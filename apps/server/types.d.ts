import { Session } from "@clerk/clerk-sdk-node";
import { Request } from "express";

export type AuthenticatedSocket = {
  userId: string;
  socketId: string;
};

declare global {
  namespace Express {
    interface Request {
      session: Session;
    }
  }
}
