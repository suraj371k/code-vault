"use client";

import { api } from "@/lib/api";
import { GetConversationMessagesResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetConversationMessages = (conversationId?: number) => {
  return useQuery<GetConversationMessagesResponse, Error>({
    queryKey: conversationId
      ? messageQueryKeys.conversationMessages(conversationId)
      : ["messages", "conversation", "missing-id", "messages"],
    queryFn: async () => {
      const res = await api.get(`/api/messages/conversation/${conversationId}`);
      return res.data;
    },
    enabled: Number.isFinite(conversationId),
  });
};

