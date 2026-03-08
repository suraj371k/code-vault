import { api } from "@/lib/api";
import { Organizations } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";

export const useOrganizations = () => {
  return useQuery<Organizations, Error>({
    queryKey: ["Organizations"],
    queryFn: async () => {
      const res = await api("/api/organization/me");
      return res.data.data;
    },
  });
};
