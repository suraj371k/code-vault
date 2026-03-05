"use client";

import { api } from "@/lib/api";
import { User } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export function useSignup() {
  return useMutation<User, Error, SignupInput>({
    mutationFn: async (data) => {
      const response = await api.post("/api/auth/signup", data);
      return response.data;
    },
  });
}
