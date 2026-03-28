import { api } from "@/lib/api";
import { MembershipResponse } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";

export const useGetOrgMembers = (organizationId: number | undefined) => {
  return useQuery<MembershipResponse, Error>({
    queryKey: ["organizationMembers", organizationId],
    enabled: !!organizationId && organizationId > 0,
    queryFn: async () => {
      const res = await api.get(`/api/organization/${organizationId}/member`);
      return res.data;
    },
  });
};
