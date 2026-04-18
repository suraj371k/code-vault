"use client";

import { api } from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import { User } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export interface LoginInput {
  email: string;
  password: string;
}

export const useLogin = () => {
  return useMutation<User, Error, LoginInput>({
    mutationFn: async (data) => {
      try {
        const response = await api.post("/api/auth/login", data);

        if (typeof window !== "undefined" && response.data?.token) {
          localStorage.setItem("auth_token", response.data.token);
          
          // Connect socket with authentication token
          try {
            connectSocket(response.data.token);
          } catch (socketError) {
            console.error("Failed to connect socket:", socketError);
            // Don't fail the login if socket connection fails
          }
        }

        return response.data;
      } catch (err) {
        // Unwrap Axios error → throw a plain Error with the server message
        if (axios.isAxiosError(err)) {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Login failed. Please try again.";
          throw new Error(msg);
        }
        throw err;
      }
    },
  });
};
