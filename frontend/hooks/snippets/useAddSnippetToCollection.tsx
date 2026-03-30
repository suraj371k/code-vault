"use client";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface AddToCollectionVars {
  snippetId: number;
  colId: number;
  organizationId: number;
}

export const useAddSnippetToCollection = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AddToCollectionVars>({
    mutationFn: async ({ snippetId, colId }) => {
      await api.patch(`/api/snippets/${snippetId}/collection/${colId}`);
    },
    onSuccess: (_, { snippetId, organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["collections", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["snippet-detail", snippetId] });
      toast.success("Added to collection!");
    },
    onError: () => toast.error("Failed to add to collection"),
  });
};
