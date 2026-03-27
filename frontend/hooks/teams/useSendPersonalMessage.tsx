"use client";

import { api } from "@/lib/api";
import { SendMessageInput, SendPersonalMessageResponse } from "@/types/conversations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageMutationKeys, messageQueryKeys } from "./keys";

export interface SendPersonalMessageVars extends SendMessageInput {
  receiverId: number;
}

export const useSendPersonalMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<SendPersonalMessageResponse, Error, SendPersonalMessageVars>({
    mutationKey: messageMutationKeys.sendPersonalMessage,
    mutationFn: async ({ receiverId, content }) => {
      const res = await api.post(`/api/messages/personal/${receiverId}/message`, {
        content,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations() });
    },
  });
};

