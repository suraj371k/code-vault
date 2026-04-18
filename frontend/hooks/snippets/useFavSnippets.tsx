"use client";
import { api } from "@/lib/api";
import { Snippet } from "@/types/snippets";
import { useQuery } from "@tanstack/react-query";
import { useHasToken } from "@/hooks/useHasToken";

export const useFavSnippets = (organizationId: number | null) => {
  const hasToken = useHasToken();

  return useQuery<Snippet[], Error>({
    queryKey: ["fav-snippets", organizationId],
    queryFn: async () => {
      const res = await api.get(
        `/api/snippets/organization/${organizationId}`,
        {
          params: { isFav: true, limit: 1000 },
        },
      );
      const raw = res.data?.data ?? res.data;
      return (raw as Snippet[]).filter((s: Snippet) => s.isFav);
    },
    enabled: hasToken && !!organizationId,
  });
};
