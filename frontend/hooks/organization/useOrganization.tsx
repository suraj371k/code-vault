import { api } from "@/lib/api";
import { Organization } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";

export const useOrganization = (slug: string) => {
  return useQuery<Organization , Error>({
    queryKey: ["organization", slug],
    queryFn: async () => {
      const response = await api.get(`/api/organization/${slug}`);
      return response.data.data;
    },
  });
};
