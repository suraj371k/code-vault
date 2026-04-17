"use client";

import { api } from "@/lib/api";
import { User } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export function useSignup() {
  return useMutation<User, Error, SignupInput>({
    mutationFn: async (data) => {
      try {
        const response = await api.post("/api/auth/signup", data);

        if (typeof window !== "undefined" && response.data?.token) {
          localStorage.setItem("auth_token", response.data.token);
        }

        return response.data;
      } catch (err) {
        // Unwrap Axios error → throw a plain Error with the server message
        if (axios.isAxiosError(err)) {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Signup failed. Please try again.";
          throw new Error(msg);
        }
        throw err;
      }
    },
  });
}
