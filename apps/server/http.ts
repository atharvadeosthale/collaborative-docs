import { Express } from "express";
import { db } from "./database/init";
import { docsTable } from "./database/schemas/docs";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { eq } from "drizzle-orm";
import { Session } from "@clerk/clerk-sdk-node";
import { authenticate } from "./middlewares/auth";

export const setupExpressServer = (app: Express) => {
  app.get("/", (req, res) => {
    res.json({ message: "Things working!" });
  });

  app.post("/documents", authenticate, async (req, res) => {
    const { title } = req.body;

    try {
      const [newDoc] = await db
        .insert(docsTable)
        .values({ userId: req.session.userId, title })
        .returning({ id: docsTable.id });

      res.status(201).json({ id: newDoc.id });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.get("/documents", authenticate, async (req, res) => {
    try {
      const documents = await db
        .select()
        .from(docsTable)
        .where(eq(docsTable.userId, req.session.userId));

      res.status(200).json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
};
