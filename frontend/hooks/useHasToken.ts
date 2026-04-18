"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after we've confirmed a token exists in localStorage.
 * Listens to the storage event so OAuth callback pages can signal token arrival
 * without a full page reload.
 */
export function useHasToken(): boolean {
  const [hasToken, setHasToken] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  });

  useEffect(() => {
    // Re-check token on window focus (e.g. returning from Stripe)
    const handleFocus = () => {
      setHasToken(!!localStorage.getItem("auth_token"));
    };

    // Listen for StorageEvent fired by OAuth callback page
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        setHasToken(!!e.newValue);
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return hasToken;
}
