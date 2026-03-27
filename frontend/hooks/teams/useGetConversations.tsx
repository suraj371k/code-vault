"use client";

import { api } from "@/lib/api";
import { GetUserConversationsResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetConversations = () => {
  return useQuery<GetUserConversationsResponse, Error>({
    queryKey: messageQueryKeys.conversations(),
    queryFn: async () => {
      const res = await api.get("/api/messages/conversation");
      return res.data;
    },
  });
};
