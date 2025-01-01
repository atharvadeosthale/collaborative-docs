import { Session } from "@clerk/clerk-sdk-node";
import { Request } from "express";

export interface AuthenticatedSocket {
  userId: string;
  socketId: string;
}

export interface Change {
  count?: number;
  value: string;
  added?: boolean;
  removed?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      session: Session;
    }
  }
}
