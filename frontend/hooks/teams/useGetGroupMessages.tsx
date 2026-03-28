"use client";

import { api } from "@/lib/api";
import { GetGroupMessagesResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetGroupMessages = (groupId?: number) => {
  return useQuery<GetGroupMessagesResponse, Error>({
    queryKey: groupId
      ? messageQueryKeys.groupMessages(groupId)
      : ["messages", "groups", "missing-id", "messages"],
    queryFn: async () => {
      const res = await api.get(`/api/messages/groups/${groupId}`);
      return res.data;
    },
    enabled: Number.isFinite(groupId),
  });
};

