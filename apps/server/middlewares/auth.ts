import { Request, Response, NextFunction } from "express";
import { clerkClient, Session } from "@clerk/clerk-sdk-node";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const sessionId = req.headers["x-session-id"];

  if (!authHeader || !authHeader.startsWith("Bearer ") || !sessionId) {
    return res.status(400).json({
      error: "Missing or invalid Authorization header or X-Session-ID",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const session: Session = await clerkClient.sessions.verifySession(
      sessionId as string,
      token
    );

    req.session = session;
    next();
  } catch (authError) {
    console.error("Authentication error:", authError);
    return res.status(401).json({ error: "Authentication failed" });
  }
};
