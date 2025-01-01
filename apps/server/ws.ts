import { clerkClient } from "@clerk/clerk-sdk-node";
import { and, eq } from "drizzle-orm";
// import { applyPatch } from "rfc6902";
import { Server } from "socket.io";
import { db } from "./database/init";
import { docsTable } from "./database/schemas/docs";
import { ParsedDiff, applyPatch } from "diff";
import type { AuthenticatedSocket, Change } from "./types";

export const setupWebSocket = (io: Server) => {
  // Map of socket ID to @AuthenticatedSocket
  let authenticatedClients = new Map<string, AuthenticatedSocket>();

  // Socket instances online on a document
  let documentSockets = new Map<string, AuthenticatedSocket[]>();

  // Socket ID to document ID Online
  let socketDocumentMap = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Authenticate the client
    socket.on("auth", async (token: string) => {
      try {
        const tokenVerification = await clerkClient.verifyToken(token);

        if (!tokenVerification.sid) throw new Error("Invalid token");

        const session = await clerkClient.sessions.getSession(
          tokenVerification.sid
        );

        if (!session) throw new Error("Invalid session");

        const user = await clerkClient.users.getUser(session.userId);

        authenticatedClients.set(socket.id, {
          userId: user.id,
          socketId: socket.id,
        });

        socket.emit("auth-success");
      } catch (error) {
        socket.emit("error", "Invalid session. Please login again.");
        socket.emit("logout");
      }
    });

    // Join a document
    socket.on("join-document", async (documentId: string) => {
      if (!authenticatedClients.has(socket.id)) {
        return socket.emit("error", "Unauthorized");
      }

      const authenticatedSocket = authenticatedClients.get(socket.id)!;

      // Create a simplified version of the socket info to avoid circular references
      const socketInfo = {
        socketId: socket.id,
        userId: authenticatedSocket.userId,
      };

      const sockets = documentSockets.get(documentId) || [];
      documentSockets.set(documentId, [...sockets, socketInfo]);
      socketDocumentMap.set(socket.id, documentId);

      await socket.join(documentId);

      // Emit only necessary information about the joined user
      socket.to(documentId).emit("user-joined", {
        id: socket.id,
        userId: authenticatedSocket.userId,
      });
    });

    // Handle document changes
    socket.on(
      "document-change",
      async (patches: string | Change | Change[]) => {
        if (!authenticatedClients.has(socket.id)) {
          return socket.emit("error", "Unauthorized");
        }

        const authenticatedSocket = authenticatedClients.get(socket.id)!;
        const documentId = socketDocumentMap.get(socket.id)!;

        console.log("Received patches:", patches);

        if (!documentId) {
          return socket.emit("error", "You are not connected to any document");
        }

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
          let content = currentDoc.content || "";
          let appliedPatches: string;

          if (typeof patches === "string") {
            appliedPatches = patches;
          } else {
            // Handle diff-chars output
            const patchArray = Array.isArray(patches) ? patches : [patches];
            let newContent = content;
            let offset = 0;

            patchArray.forEach((change) => {
              if (change.added) {
                newContent =
                  newContent.slice(0, offset) +
                  change.value +
                  newContent.slice(offset);
                offset += change.value.length;
              } else if (change.removed) {
                newContent =
                  newContent.slice(0, offset) +
                  newContent.slice(offset + change.value.length);
              } else {
                offset += change.value.length;
              }
            });

            appliedPatches = newContent;
          }

          console.log("Applied content:", appliedPatches);

          // Update the document with the new content
          const result = await db
            .update(docsTable)
            .set({ content: appliedPatches })
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

          socket.to(documentId).emit("document-updated", documentId, patches);
        } catch (error) {
          console.error("Error updating document:", error);
          socket.emit("error", "Failed to update document");
        }
      }
    );

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      authenticatedClients.delete(socket.id);
      socketDocumentMap.delete(socket.id);
    });
  });
};
