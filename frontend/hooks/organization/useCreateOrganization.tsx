import { api } from "@/lib/api";
import { Organizations, OrganizationInput } from "@/types/organization";
import { useMutation } from "@tanstack/react-query";

export const useCreateOrganization = () => {
  return useMutation<Organizations, Error, OrganizationInput>({
    mutationFn: async (data) => {
      const res = await api.post("/api/organization" , data);
      return res.data;
    },
  });
};
