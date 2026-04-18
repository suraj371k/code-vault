import { api } from "@/lib/api";
import { Organizations } from "@/types/organization";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/** Returns true only after we've confirmed a token exists in localStorage. */
function useHasToken() {
  const [hasToken, setHasToken] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  });

  useEffect(() => {
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

export const useOrganizations = () => {
  const hasToken = useHasToken();
  const queryClient = useQueryClient();

  // Re-fetch after Google OAuth token arrives
  useEffect(() => {
    if (hasToken) {
      queryClient.invalidateQueries({ queryKey: ["Organizations"] });
    }
  }, [hasToken, queryClient]);

  return useQuery<Organizations[], Error>({
    queryKey: ["Organizations"],
    queryFn: async () => {
      const res = await api("/api/organization/me");
      return res.data.data;
    },
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
