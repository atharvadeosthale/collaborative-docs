"use client";

import { useAuth } from "@clerk/nextjs";
import MarkdownEditor from "@uiw/react-markdown-editor";
import { useEffect, useState } from "react";
import { createPatch } from "rfc6902";
import { diffChars } from "diff";
import { io, Socket } from "socket.io-client";

export default function DocumentEditor({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  const [socket, setSocket] = useState<Socket>();
  const [documentContent, setDocumentContent] = useState(content);
  const { getToken } = useAuth();

  console.log(documentContent, content);

  // useEffect(() => {
  //   setDocumentContent(content);
  // }, [content]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);

    socket.on("connect", () => {
      setSocket(socket);
      setupListeners(socket);
      initSocket(socket);
    });

    // Disconnect socket when done, fixes duplicate socket connections
    return () => {
      socket.disconnect();
      removeListeners(socket);
    };
  }, []);

  const setupListeners = (socket: Socket) => {
    if (!socket) return;

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

  const removeListeners = (socket: Socket) => {
    socket.off("document-updated");
    socket.off("error");
    socket.off("logout");
  };

  const initSocket = async (socket: Socket) => {
    if (!socket) return;

    // socket.on("connect", async () => {
    const token = await getToken();
    socket.emit("auth", token);

    socket.on("auth-success", () => {
      socket.emit("join-document", id);
    });
    // });
  };

  const handleChange = (value: string) => {
    if (!socket) return;

    // const patches = createPatch(
    //   { content: documentContent },
    //   { content: value }
    // );

    const patches = diffChars(documentContent, value);

    console.log("patches", patches);

    socket.emit("document-change", patches);
    setDocumentContent(value);
  };

  return (
    <div>
      <MarkdownEditor
        value={documentContent}
        onChange={handleChange}
        className="min-h-96"
        visible
      />
    </div>
  );
}
