"use client";

import { api } from "@/lib/api";
import { User } from "@/types/auth";
import {  useQuery } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery<User, Error>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/api/auth/profile");
      return response.data.data;
    },
  });
};
