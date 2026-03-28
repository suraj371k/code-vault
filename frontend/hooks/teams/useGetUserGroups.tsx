"use client";

import { api } from "@/lib/api";
import { GetUserGroupsResponse } from "@/types/conversations";
import { useQuery } from "@tanstack/react-query";
import { messageQueryKeys } from "./keys";

export const useGetUserGroups = () => {
  return useQuery<GetUserGroupsResponse, Error>({
    queryKey: messageQueryKeys.myGroups(),
    queryFn: async () => {
      const res = await api.get("/api/messages/groups");
      return res.data;
    },
  });
};

