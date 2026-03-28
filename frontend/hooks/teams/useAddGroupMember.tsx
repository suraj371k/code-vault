"use client";

import { api } from "@/lib/api";
import { AddGroupMemberInput, AddGroupMemberResponse } from "@/types/conversations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageMutationKeys, messageQueryKeys } from "./keys";

export const useAddGroupMember = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation<AddGroupMemberResponse, Error, AddGroupMemberInput>({
    mutationKey: messageMutationKeys.addGroupMember,
    mutationFn: async (data) => {
      const res = await api.post(`/api/messages/groups/${groupId}/member`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.groupMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.myGroups() });
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.groupsAll() });
    },
  });
};

