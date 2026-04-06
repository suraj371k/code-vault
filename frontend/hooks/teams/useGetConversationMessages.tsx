"use client";

import { api } from "@/lib/api";
import { GetConversationMessagesResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetConversationMessages = (
  conversationId?: number,
  organizationId?: number,
) => {
  return useQuery<GetConversationMessagesResponse, Error>({
    queryKey: conversationId
      ? [...messageQueryKeys.conversationMessages(conversationId), organizationId]
      : ["messages", "conversation", "missing-id", "messages"],
    queryFn: async () => {
      const res = await api.get(
        `/api/messages/conversation/org/${organizationId}/${conversationId}/messages`,
      );
      return res.data;
    },
    enabled: Number.isFinite(conversationId) && Number.isFinite(organizationId),
  });
};
