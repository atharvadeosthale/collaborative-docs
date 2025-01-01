"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import React from "react";

export default function Login() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen flex mt-40 justify-center">
      <SignUp
        fallbackRedirectUrl="/dashboard"
        appearance={{ baseTheme: resolvedTheme === "dark" ? dark : undefined }}
      />
    </div>
  );
}