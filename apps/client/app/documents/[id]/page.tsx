import DocumentEditor from "@/components/document-editor";
import React from "react";

export default function Document({ params }: { params: { id: string } }) {
  // Fetch the document, and pass to client component for websocket connection

  return (
    <div>
      <DocumentEditor id={params.id} />
    </div>
  );
}
