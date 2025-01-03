import { Express } from "express";
import { db } from "./database/init";
import { docsTable } from "./database/schemas/docs";
import { eq } from "drizzle-orm";
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

  app.get("/documents/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    try {
      const [document] = await db
        .select({ content: docsTable.content })
        .from(docsTable)
        .where(eq(docsTable.id, parseInt(id)));

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.status(200).json({ content: document.content });
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });
};
