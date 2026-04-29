"use client";

import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

import ProductForm from "@/components/ProductForm";

export function AuthGreeting() {
  const { isLoaded, userId } = useAuth();
  
  if (!isLoaded) return <div className="mt-6 h-10" />;
  
  if (userId) {
    return (
      <>
        <p className="text-sm text-slate-600">Welcome back, creator!</p>
        <ProductForm />
      </>
    );
  }
  
  return (
    <div className="mt-6">
      <SignInButton mode="modal">
        <button className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          Sign in to start
        </button>
      </SignInButton>
    </div>
  );
}