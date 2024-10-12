import { Request, Response, NextFunction } from "express";
import { clerkClient, Session } from "@clerk/clerk-sdk-node";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({
      error: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const tokenVerification = await clerkClient.verifyToken(token);

    if (!tokenVerification.sid) throw new Error("Invalid token");

    const session = await clerkClient.sessions.getSession(
      tokenVerification.sid
    );

    if (!session) throw new Error("Invalid session");

    req.session = session;
    next();
  } catch (authError) {
    console.error("Authentication error:", authError);
    return res.status(401).json({ error: "Authentication failed" });
  }
};
