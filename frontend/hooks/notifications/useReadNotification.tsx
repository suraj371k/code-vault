import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useReadNotification = (
  organizationId: number | undefined,
  notificationId: number | undefined,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch(
        `/api/notifications/${organizationId}/${notificationId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-notifications"] });
    },
  });
};
