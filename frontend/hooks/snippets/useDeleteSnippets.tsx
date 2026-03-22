import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteSnippets = (snippetId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/api/snippets/${snippetId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-snippets"] });
    },
  });
};
