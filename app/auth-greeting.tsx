"use client";

import { useAuth } from "@clerk/nextjs";

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
  
  return null;
}