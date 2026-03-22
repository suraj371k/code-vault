"use client";

import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.post("/api/auth/logout");
        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Logout failed. Please try again.";
          throw new Error(msg);
        }
        throw err;
      }
    },
    onSuccess: () => {
      // Clear ALL cached queries so protected data is wiped on next login
      queryClient.clear();
    },
  });
};
