"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export interface TeamMember {
  userId: number;
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface GetTeamMembersResponse {
  success: boolean;
  data: TeamMember[];
}

export const useGetMembers = (organizationId: number | undefined) => {
  return useQuery<GetTeamMembersResponse, Error>({
    queryKey: [...messageQueryKeys.all, "orgMembers", organizationId],
    enabled: !!organizationId && organizationId > 0,
    queryFn: async () => {
      const res = await api.get(`/api/organization/${organizationId}/member`);
      return res.data;
    },
  });
};
