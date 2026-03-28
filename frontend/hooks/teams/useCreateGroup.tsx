"use client";

import { api } from "@/lib/api";
import { CreateGroupInput, CreateGroupResponse } from "@/types/conversations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageMutationKeys, messageQueryKeys } from "./keys";

export const useCreateGroup = (organizationId: number) => {
  const queryClient = useQueryClient();

  return useMutation<CreateGroupResponse, Error, CreateGroupInput>({
    mutationKey: messageMutationKeys.createGroup,
    mutationFn: async (data) => {
      const res = await api.post(`/api/messages/groups/${organizationId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.myGroups() });
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.groupsAll() });
    },
  });
};

