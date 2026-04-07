import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteNotification = (
  notificationId: number | undefined,
  organizationId: number | undefined,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        `/api/notifications/${organizationId}/${notificationId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-notifications"] });
    },
  });
};
