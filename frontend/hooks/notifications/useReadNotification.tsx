import { api } from "@/lib/api";
import { NotificationResponse } from "@/types/notification";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";

interface ReadNotificationContext {
  previousNotifications: [QueryKey, NotificationResponse | undefined][];
}

export const useReadNotification = (
  organizationId: number | undefined,
  notificationId: number | undefined,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!organizationId || !notificationId) {
        throw new Error("Organization ID and notification ID are required");
      }

      const res = await api.patch(
        `/api/notifications/${organizationId}/${notificationId}`,
      );
      return res.data;
    },
    onMutate: async (): Promise<ReadNotificationContext> => {
      if (!organizationId || !notificationId) {
        return { previousNotifications: [] };
      }

      await queryClient.cancelQueries({
        queryKey: ["get-notifications", organizationId],
      });

      const previousNotifications =
        queryClient.getQueriesData<NotificationResponse>({
          queryKey: ["get-notifications", organizationId],
        });

      previousNotifications.forEach(([queryKey, cached]) => {
        if (!cached) return;

        queryClient.setQueryData<NotificationResponse>(queryKey, {
          ...cached,
          data: cached.data.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        });
      });

      return { previousNotifications };
    },
    onError: (_error, _vars, context) => {
      context?.previousNotifications.forEach(([queryKey, cached]) => {
        queryClient.setQueryData(queryKey, cached);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-notifications", organizationId],
      });
    },
  });
};
