"use client";
import { api } from "@/lib/api";
import { Collection } from "@/types/snippets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface CreateCollectionVars {
  name: string;
  organizationId: number;
}

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation<Collection, Error, CreateCollectionVars>({
    mutationFn: async ({ name, organizationId }) => {
      const res = await api.post(`/api/snippets/collection/${organizationId}`, { name });
      return res.data.data;
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["collections", organizationId] });
      toast.success("Collection created!");
    },
    onError: () => toast.error("Failed to create collection"),
  });
};
