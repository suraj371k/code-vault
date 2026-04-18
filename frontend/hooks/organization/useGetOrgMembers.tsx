import { api } from "@/lib/api";
import { MembershipResponse } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { useHasToken } from "@/hooks/useHasToken";

export const useGetOrgMembers = (organizationId: number | undefined) => {
  const hasToken = useHasToken();

  return useQuery<MembershipResponse, Error>({
    queryKey: ["organizationMembers", organizationId],
    enabled: hasToken && !!organizationId && organizationId > 0,
    queryFn: async () => {
      const res = await api.get(`/api/organization/${organizationId}/member`);
      return res.data;
    },
  });
};
