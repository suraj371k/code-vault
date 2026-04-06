"use client";

import { api } from "@/lib/api";
import { GetUserConversationsResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetConversations = (
  organizationId: number | undefined,
) => {
  return useQuery<GetUserConversationsResponse, Error>({
    queryKey: [...messageQueryKeys.conversations(), organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const res = await api.get(
        `/api/messages/conversation/org/${organizationId}`,
      );
      return res.data;
    },
  });
};
