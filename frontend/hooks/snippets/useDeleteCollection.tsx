"use client";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface DeleteCollectionVars {
  colId: number;
  organizationId: number;
}

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteCollectionVars>({
    mutationFn: async ({ colId }) => {
      await api.delete(`/api/snippets/collection/${colId}`);
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["collections", organizationId] });
      toast.success("Collection deleted");
    },
    onError: () => toast.error("Failed to delete collection"),
  });
};
