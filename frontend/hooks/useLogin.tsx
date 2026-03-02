"use client";

import { api } from "@/lib/api";
import { User } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

export interface LoginInput {
  email: string;
  password: string;
}

export const useLogin = () => {
  return useMutation<User, Error, LoginInput>({
    mutationFn: async (data) => {
      const response = await api.post("/api/auth/login", data);
      return response.data;
    },
  });
};
