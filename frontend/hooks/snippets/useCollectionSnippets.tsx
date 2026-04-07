"use client";
import { api } from "@/lib/api";
import { CollectionWithSnippets } from "@/types/snippets";
import { useQuery } from "@tanstack/react-query";

export const useCollectionSnippets = (colId: number | null) => {
  return useQuery<CollectionWithSnippets, Error>({
    queryKey: ["collection-snippets", colId],
    queryFn: async () => {
      const res = await api.get(`/api/snippets/collection/${colId}`);
      return res.data.data;
    },
    enabled: !!colId,
  });
};
