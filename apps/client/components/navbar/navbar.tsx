import React, { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <div>
      <div className="flex justify-between items-center py-7">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            <Link href="/">Collaborative Documents</Link>
          </h1>
        </div>
        <div className="flex items-center gap-5">
          {userId ? (
            <>
              {/* TODO: Wrap UserButton inside a client component and change appearance based on theme */}
              <Link className="hover:underline" href="/dashboard">
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link className="hover:underline" href="/login">
                Login
              </Link>
              <Link className="hover:underline" href="/register">
                Register
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
