import { axiosInstance } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import React from "react";

export default async function Dashboard() {
  const { sessionId, getToken } = await auth();

  const response = await axiosInstance.get("/documents", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getToken()}`,
      "X-Session-ID": sessionId,
    },
  });

  console.log(response.data);

  return <div>Dashboard</div>;
}
