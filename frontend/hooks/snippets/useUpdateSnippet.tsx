import { api } from "@/lib/api";
import { Snippet, UpdateSnippetInput } from "@/types/snippets";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateSnippet = (snippetId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Snippet, Error, UpdateSnippetInput>({
    mutationFn: async (data) => {
      const res = await api.patch(`/api/snippets/${snippetId}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippet-detail", snippetId] });
    },
  });
};
