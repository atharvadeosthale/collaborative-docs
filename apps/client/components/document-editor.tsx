"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function DocumentEditor({ id }: { id: string }) {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
    setSocket(socket);
    setupListeners(socket);

    // Join the document room
    socket.emit("join-document", id);

    // Disconnect socket when done, fixes duplicate socket connections
    return () => {
      socket.disconnect();
    };
  }, []);

  const setupListeners = (socket: Socket) => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("document-updated", (documentId, patches) => {
      console.log("Document updated", documentId, patches);
    });

    socket.on("error", (error) => {
      console.error("Error:", error);
    });

    socket.on("logout", () => {
      console.log("Logged out");
    });
  };

  return <div>DocumentEditor</div>;
}
