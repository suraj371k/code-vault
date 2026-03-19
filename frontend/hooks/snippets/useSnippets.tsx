import { api } from "@/lib/api";
import { SnippetResponse } from "@/types/snippets";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface UseSnippetsParams {
  organizationId: number;
  page?: number;
  search?: string;
}

export const useSnippets = ({
  organizationId,
  page = 1,
  search,
}: UseSnippetsParams) => {
  return useQuery<SnippetResponse, Error>({
    queryKey: ["get-snippets", organizationId, page, search],
    queryFn: async () => {
      const res = await api.get(
        `/api/snippets/organization/${organizationId}`,
        {
          params: { page, limit: 8, ...(search?.trim() && { search }) },
        },
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: !!organizationId,
  });
};
