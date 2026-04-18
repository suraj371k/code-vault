"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { connectSocket } from "@/lib/socket";

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const redirect = params.get("redirect") || "/";

    if (token) {
      try {
        // Store token in localStorage
        localStorage.setItem("auth_token", token);
        
        // Connect socket with authentication token
        connectSocket(token);
        
        // Redirect to the appropriate page
        const safeRedirect = redirect.startsWith("/") ? redirect : "/";
        router.replace(safeRedirect);
      } catch (error) {
        console.error("Error during authentication callback:", error);
        router.replace("/login?error=authentication_failed");
      }
    } else {
      router.replace("/login?error=authentication_failed");
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin w-8 h-8 text-teal-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <p className="text-white/40 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense>
      <AuthCallbackInner />
    </Suspense>
  );
}
