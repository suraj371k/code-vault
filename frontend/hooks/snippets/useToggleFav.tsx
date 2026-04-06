"use client";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ToggleFavVars {
  snippetId: number;
  isFav: boolean;
  organizationId: number;
}

export const useToggleFav = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ToggleFavVars>({
    mutationFn: async ({ snippetId, isFav }) => {
      const endpoint = isFav
        ? `/api/snippets/${snippetId}/unfav`
        : `/api/snippets/${snippetId}/fav`;
      await api.patch(endpoint);
    },
    onSuccess: (_, { snippetId, isFav, organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ["snippet-detail", snippetId] });
      queryClient.invalidateQueries({ queryKey: ["get-snippets", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["fav-snippets", organizationId] });
      toast.success(isFav ? "Removed from favourites" : "Added to favourites ❤️");
    },
    onError: () => toast.error("Failed to update favourites"),
  });
};
