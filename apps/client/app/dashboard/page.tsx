import AllDocuments from "@/components/documents/all-documents";
import { Button } from "@/components/ui/button";
import React, { Suspense } from "react";

export default async function Dashboard() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl">Your Documents</h1>
        </div>
        <div>
          <Button>New Document</Button>
        </div>
      </div>

      <div className="mt-10">
        <Suspense fallback={<div>Loading...</div>}>
          <AllDocuments />
        </Suspense>
      </div>
    </div>
  );
}
