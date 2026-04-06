"use client";
import { api } from "@/lib/api";
import { Snippet } from "@/types/snippets";
import { useQuery } from "@tanstack/react-query";

export const useFavSnippets = (organizationId: number | null) => {
  return useQuery<Snippet[], Error>({
    queryKey: ["fav-snippets", organizationId],
    queryFn: async () => {
      const res = await api.get(
        `/api/snippets/organization/${organizationId}`,
        {
          params: { isFav: true, limit: 1000 },
        },
      );
      // Support both { data: [...] } and plain array responses
      const raw = res.data?.data ?? res.data;
      return (raw as Snippet[]).filter((s: Snippet) => s.isFav);
    },
    enabled: !!organizationId,
  });
};
