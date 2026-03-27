"use client";

import { api } from "@/lib/api";
import { GetGroupsResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetGroupsAll = () => {
  return useQuery<GetGroupsResponse, Error>({
    queryKey: messageQueryKeys.groupsAll(),
    queryFn: async () => {
      const res = await api.get("/api/messages/groups/all");
      return res.data;
    },
  });
};

