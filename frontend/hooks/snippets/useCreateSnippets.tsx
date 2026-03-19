import { api } from "@/lib/api";
import { CreateSnippetInput, SnippetResponse } from "@/types/snippets";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateSnippet = (organizationId: number) => {
  const queryClient = useQueryClient();
  return useMutation<SnippetResponse, Error, CreateSnippetInput>({
    mutationFn: async (data) => {
      const res = await api.post(`/api/snippets/${organizationId}`, data);
      return res.data;
    },
    mutationKey: ["create-snippet"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-snippets"] });
    },
  });
};
