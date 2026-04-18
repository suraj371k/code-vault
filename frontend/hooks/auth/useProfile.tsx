"use client";

import { api } from "@/lib/api";
import { User } from "@/types/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useHasToken } from "@/hooks/useHasToken";

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
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
