import { api } from "@/lib/api";
import { Organizations } from "@/types/organization";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useHasToken } from "@/hooks/useHasToken";

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
