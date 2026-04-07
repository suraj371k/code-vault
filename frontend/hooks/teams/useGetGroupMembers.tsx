"use client";

import { api } from "@/lib/api";
import { GetGroupMembersResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetGroupMembers = (groupId?: number, organizationId?: number) => {
  return useQuery<GetGroupMembersResponse, Error>({
    queryKey: groupId
      ? [...messageQueryKeys.groupMembers(groupId), organizationId]
      : ["messages", "groups", "missing-id", "members"],
    queryFn: async () => {
      const res = await api.get(
        `/api/messages/groups/org/${organizationId}/${groupId}/member`,
      );
      return res.data;
    },
    enabled: Number.isFinite(groupId) && Number.isFinite(organizationId),
  });
};

