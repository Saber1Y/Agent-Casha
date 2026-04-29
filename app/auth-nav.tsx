"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function AuthNav() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) return null;

  return (
    <div className="flex items-center gap-3">
      {userId && (
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Dashboard
        </Link>
      )}
    </div>
  );
}