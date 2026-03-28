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

  return useMutation<StartConversationResponse, Error, { receiverId: number }>({
    mutationFn: async ({ receiverId }) => {
      // Send an empty "hello" or use a dedicated start-conversation endpoint
      // Adjust the endpoint to match your backend
      const res = await api.post(`/api/messages/personal/${receiverId}/start`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations() });
    },
  });
};
