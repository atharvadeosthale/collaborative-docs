import { Express } from "express";
import { db } from "./database/init";
import { docsTable } from "./database/schemas/docs";
import { clerkClient, Session } from "@clerk/clerk-sdk-node";

export const setupExpressServer = (app: Express) => {
  app.get("/", (req, res) => {
    res.json("Things working!");
  });

  app.post("/document", async (req, res) => {
    const { sessionId, token, title } = req.body;

    if (!sessionId || !token || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let session: Session;

    try {
      session = await clerkClient.sessions.verifySession(sessionId, token);
    } catch (authError) {
      console.error("Authentication error:", authError);
      return res.status(401).json({ error: "Authentication failed" });
    }

    try {
      const [newDoc] = await db
        .insert(docsTable)
        .values({ userId: session.userId, title })
        .returning({ id: docsTable.id });

      res.status(201).json({ id: newDoc.id });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });
};
