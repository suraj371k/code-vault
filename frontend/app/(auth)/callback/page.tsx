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

      if (!token) {
        console.error("OAuth Callback - No token received");
        router.replace("/login?error=authentication_failed");
        return;
      }

      try {
        // 1. Persist token FIRST before anything else
        localStorage.setItem("auth_token", token);

        // 2. Dispatch a storage event so any already-mounted components
        //    (e.g. useProfile, useOrganizations) know the token is now ready
        //    and can re-fetch without needing a full page reload.
        window.dispatchEvent(new StorageEvent("storage", {
          key: "auth_token",
          newValue: token,
          storageArea: localStorage,
        }));

        // 3. Connect socket with the new token
        try {
          connectSocket(token);
        } catch (socketError) {
          console.error("Socket connection failed:", socketError);
          // Don't block the redirect if socket fails
        }

        // 4. Give localStorage & event listeners a moment to settle before
        //    navigating, so the destination page already has the token.
        await new Promise((resolve) => setTimeout(resolve, 150));

        const safeRedirect = redirect.startsWith("/") ? redirect : "/";
        router.replace(safeRedirect);
      } catch (error) {
        console.error("Error during authentication callback:", error);
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
