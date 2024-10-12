import DocumentEditor from "@/components/document-editor";
import { axiosInstance } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function Document({ params }: { params: { id: string } }) {
  // TODO: Wrap suspense so that this is non-blocking
  const getDocument = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/documents/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth().getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch document:", error);
      redirect("/dashboard");
    }
  };

  const document = await getDocument(params.id);
  const content = document.content;

  console.log(content);

  return (
    <div>
      <DocumentEditor id={params.id} content={content} />
    </div>
  );
}
