"use client";
import { api } from "@/lib/api";
import { Collection } from "@/types/snippets";
import { useQuery } from "@tanstack/react-query";
import { useHasToken } from "@/hooks/useHasToken";

export const useCollections = (organizationId: number) => {
  const hasToken = useHasToken();

  return useQuery<Collection[], Error>({
    queryKey: ["collections", organizationId],
    queryFn: async () => {
      const res = await api.get(`/api/snippets/collections/${organizationId}`);
      return res.data.data;
    },
    enabled: hasToken && !!organizationId,
  });
};
