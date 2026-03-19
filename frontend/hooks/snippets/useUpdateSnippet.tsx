import { api } from "@/lib/api";
import { Snippet } from "@/types/snippets";
import { useMutation } from "@tanstack/react-query";

export const useUpdateSnippet = (snippetId: number) => {
  return useMutation<Snippet, Error , {code: string}>({
    mutationFn: async (data) => {
      const res = await api.patch(`/api/snippets/${snippetId}`, data);
      return res.data;
    },
  });
};
