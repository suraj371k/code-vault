"use client";

import { api } from "@/lib/api";
import { GetGroupsResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetGroupsAll = (organizationId: number | undefined) => {
  return useQuery<GetGroupsResponse, Error>({
    queryKey: [...messageQueryKeys.groupsAll(), organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const res = await api.get(`/api/messages/groups/org/${organizationId}`);
      return res.data;
    },
  });
};
