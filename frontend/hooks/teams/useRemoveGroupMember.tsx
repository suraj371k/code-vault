"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

interface RemoveGroupMemberResponse {
  success: boolean;
  message: string;
  data: {
    groupId: number;
    userId: number;
  };
}

interface RemoveGroupMemberInput {
  organizationId: number;
  groupId: number;
  memberUserId: number;
}

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation<RemoveGroupMemberResponse, Error, RemoveGroupMemberInput>({
    mutationKey: ["messages", "removeGroupMember"],
    mutationFn: async ({ organizationId, groupId, memberUserId }) => {
      const res = await api.delete(
        `/api/messages/groups/org/${organizationId}/${groupId}/member/${memberUserId}`,
      );
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: [...messageQueryKeys.groupMembers(vars.groupId), vars.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: [...messageQueryKeys.myGroups(), vars.organizationId],
      });
    },
  });
};
