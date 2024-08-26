import type { AuthenticatedSocket } from "./types";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { Server } from "socket.io";
import { db } from "./database/init";
import { docsTable } from "./database/schemas/docs";
import { eq, and, sql } from "drizzle-orm";
import { applyPatch } from "rfc6902"; // You'll need to install this package

export const setupWebSocket = (io: Server) => {
  // Map of socket ID to @AuthenticatedSocket
  let authenticatedClients = new Map<string, AuthenticatedSocket>();

  // Socket instances online on a document
  let documentSockets = new Map<string, AuthenticatedSocket[]>();

  io.on("connect", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Authenticate the client
    socket.on("auth", async (sessionId: string, token: string) => {
      try {
        const session = await clerkClient.sessions.verifySession(
          sessionId,
          token
        );
        const user = await clerkClient.users.getUser(session.userId);

        authenticatedClients.set(socket.id, { socket, userId: user.id });
      } catch (error) {
        socket.emit("error", "Invalid session. Please login again.");
        socket.emit("logout");
      }
    });

    // Join a document
    socket.on("join-document", (documentId: string) => {
      if (!authenticatedClients.has(socket.id)) {
        return socket.emit("error", "Unauthorized");
      }

      const sockets = documentSockets.get(documentId) || [];
      documentSockets.set(documentId, [
        ...sockets,
        authenticatedClients.get(socket.id)!,
      ]);
    });

    // Handle document changes
    socket.on("document-change", async (documentId: string, patches: any[]) => {
      if (!authenticatedClients.has(socket.id)) {
        return socket.emit("error", "Unauthorized");
      }

      const authenticatedSocket = authenticatedClients.get(socket.id)!;

      try {
        // Fetch the current document content
        const [currentDoc] = await db
          .select({ content: docsTable.content })
          .from(docsTable)
          .where(
            and(
              eq(docsTable.id, parseInt(documentId)),
              eq(docsTable.userId, authenticatedSocket.userId)
            )
          );

        if (!currentDoc) {
          return socket.emit(
            "error",
            "Document not found or you don't have permission to edit"
          );
        }

        // Apply the patches to the current content
        let newContent = currentDoc.content;
        applyPatch(newContent, patches);

        // Update the document with the new content
        const result = await db
          .update(docsTable)
          .set({ content: newContent })
          .where(
            and(
              eq(docsTable.id, parseInt(documentId)),
              eq(docsTable.userId, authenticatedSocket.userId)
            )
          )
          .returning();

        if (result.length === 0) {
          return socket.emit("error", "Failed to update document");
        }

        // Broadcast the change to all clients in the document
        const socketsInDocument = documentSockets.get(documentId) || [];
        socketsInDocument.forEach((client) => {
          if (client.socket.id !== socket.id) {
            client.socket.emit("document-updated", documentId, patches);
          }
        });
      } catch (error) {
        console.error("Error updating document:", error);
        socket.emit("error", "Failed to update document");
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      authenticatedClients.delete(socket.id);
    });
  });
};
