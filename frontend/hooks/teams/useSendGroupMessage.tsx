"use client";

import { api } from "@/lib/api";
import { SendGroupMessageResponse, SendMessageInput } from "@/types/conversations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageMutationKeys, messageQueryKeys } from "./keys";

export interface SendGroupMessageVars extends SendMessageInput {
  groupId: number;
  organizationId: number;
}

export const useSendGroupMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<SendGroupMessageResponse, Error, SendGroupMessageVars>({
    mutationKey: messageMutationKeys.sendGroupMessage,
    mutationFn: async ({ groupId, content, organizationId }) => {
      const res = await api.post(
        `/api/messages/groups/org/${organizationId}/${groupId}/message`,
        {
          content,
        },
      );
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.groupMessages(vars.groupId) });
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations() });
    },
  });
};

