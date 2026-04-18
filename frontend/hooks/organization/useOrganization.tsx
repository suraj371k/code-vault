import { api } from "@/lib/api";
import { Organization } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { useHasToken } from "@/hooks/useHasToken";

export const useOrganization = (slug: string) => {
  const hasToken = useHasToken();

  return useQuery<Organization, Error>({
    queryKey: ["organization", slug],
    queryFn: async () => {
      const response = await api.get(`/api/organization/${slug}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: hasToken && !!slug,
  });
};
