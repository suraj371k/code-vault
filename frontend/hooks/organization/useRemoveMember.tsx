"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageQueryKeys } from "../teams/keys";

interface RemoveMemberResponse {
  success: boolean;
  message: string;
  data: {
    memberId: number;
    userId: number;
  };
}

interface RemoveMemberInput {
  organizationId: number;
  memberId: number;
}

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation<RemoveMemberResponse, Error, RemoveMemberInput>({
    mutationFn: async ({ organizationId, memberId }) => {
      const res = await api.delete(
        `/api/organization/${organizationId}/member/${memberId}`,
      );
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: [...messageQueryKeys.all, "orgMembers", vars.organizationId],
      });
    },
  });
};
