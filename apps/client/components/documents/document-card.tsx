import React from "react";
import Link from "next/link";
export default function DocumentCard({
  title,
  id,
}: {
  title: string;
  id: number;
}) {
  return (
    <div className="border border-gray-500 rounded-md p-4 flex justify-between items-center">
      <Link
        href={`/documents/${id}`}
        className="text-lg line-clamp-2 hover:underline"
      >
        {title}
      </Link>
      <button className="ml-4 text-2xl" aria-label="Open document">
        &rarr;
      </button>
    </div>
  );
}
