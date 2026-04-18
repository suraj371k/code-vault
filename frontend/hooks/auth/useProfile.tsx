"use client";

import { api } from "@/lib/api";
import { User } from "@/types/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/** Returns true only after we've confirmed a token exists in localStorage. */
function useHasToken() {
  const [hasToken, setHasToken] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  });

  useEffect(() => {
    // Listen for the StorageEvent fired by the OAuth callback page so we
    // can enable the query without a full page reload.
    const handler = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        setHasToken(!!e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return hasToken;
}

export const useProfile = () => {
  const hasToken = useHasToken();
  const queryClient = useQueryClient();

  // When the token appears (Google OAuth callback), immediately invalidate
  // any stale/failed profile query so it re-fetches with the new token.
  useEffect(() => {
    if (hasToken) {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  }, [hasToken, queryClient]);

  return useQuery<User, Error>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/api/auth/profile");
      return response.data.data;
    },
    // Don't fire at all until we know a token is present
    enabled: hasToken,
    // Keep data fresh for 5 minutes; profile rarely changes mid-session
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
