"use client";

import { api } from "@/lib/api";
import { GetUserGroupsResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetUserGroups = (organizationId: number | undefined) => {
  return useQuery<GetUserGroupsResponse, Error>({
    queryKey: [...messageQueryKeys.myGroups(), organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const res = await api.get(`/api/messages/groups/org/${organizationId}`);
      return res.data;
    },
  });
};
