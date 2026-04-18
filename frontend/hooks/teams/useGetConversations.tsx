"use client";

import { api } from "@/lib/api";
import { GetUserConversationsResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";
import { useHasToken } from "@/hooks/useHasToken";

export const useGetConversations = (
  organizationId: number | undefined,
) => {
  const hasToken = useHasToken();

  return useQuery<GetUserConversationsResponse, Error>({
    queryKey: [...messageQueryKeys.conversations(), organizationId],
    enabled: hasToken && !!organizationId,
    queryFn: async () => {
      const res = await api.get(
        `/api/messages/conversation/org/${organizationId}`,
      );
      return res.data;
    },
  });
};
