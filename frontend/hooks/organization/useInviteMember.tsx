import { api } from "@/lib/api";
import { MembershipInput, MembershipResponse } from "@/types/organization";
import { useMutation } from "@tanstack/react-query";



export const useInviteMembers = (organizationId: number) => {
  return useMutation<MembershipResponse, Error, MembershipInput>({
    mutationFn: async (data) => {
      const res = await api.post(
        `/api/organization/${organizationId}/member`,
        data,
      );
      return res.data;
    },
  });
};