import { axiosInstance } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import DocumentCard from "./document-card";

export default async function AllDocuments() {
  const { getToken } = auth();

  const documents = await axiosInstance("/documents", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {documents.data.map((document: any) => (
        <DocumentCard
          key={document.id}
          title={document.title}
          id={document.id}
        />
      ))}
    </div>
  );
}
