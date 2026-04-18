"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { connectSocket } from "@/lib/socket";

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = params.get("token");
      const redirect = params.get("redirect") || "/";

      console.log("OAuth Callback - Token received:", token ? "✓" : "✗");

      if (token) {
        try {
          // Store token in localStorage
          localStorage.setItem("auth_token", token);
          
          // Verify token was stored
          const storedToken = localStorage.getItem("auth_token");
          console.log("Token stored successfully:", storedToken ? "✓" : "✗");
          
          // Connect socket with authentication token
          try {
            connectSocket(token);
            console.log("Socket connection initiated");
          } catch (socketError) {
            console.error("Socket connection failed:", socketError);
            // Don't block redirect if socket fails
          }
          
          // Small delay to ensure localStorage is synced
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Redirect to the appropriate page
          const safeRedirect = redirect.startsWith("/") ? redirect : "/";
          console.log("Redirecting to:", safeRedirect);
          router.replace(safeRedirect);
        } catch (error) {
          console.error("Error during authentication callback:", error);
          router.replace("/login?error=authentication_failed");
        }
      } else {
        console.error("No token received in callback");
        router.replace("/login?error=authentication_failed");
      }
    };

    handleCallback();
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
