"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export function UserButton() {
  return (
    <div className="flex items-center">
      <ClerkUserButton />
    </div>
  );
}