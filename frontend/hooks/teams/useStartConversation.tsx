"use client";

import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";
import { Conversation } from "@/types/conversations";

export interface StartConversationResponse {
  success: boolean;
  data: Conversation;
}

export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    StartConversationResponse,
    Error,
    { receiverId: number; organizationId: number; content?: string }
  >({
    mutationFn: async ({ receiverId, organizationId, content }) => {
      const res = await api.post(
        `/api/messages/personal/${organizationId}/${receiverId}/message`,
        {
          content: content ?? "Hi",
        },
      );
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: [...messageQueryKeys.conversations(), vars.organizationId],
      });
    },
  });
};
