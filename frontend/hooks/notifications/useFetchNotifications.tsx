import { api } from "@/lib/api";
import { NotificationResponse } from "@/types/notification";
import { useQuery } from "@tanstack/react-query";

export const useFetchNotifications = (
  organizationId: number | undefined,
  page: number = 1,
  limit: number = 5,
) => {
  return useQuery<NotificationResponse, Error>({
    queryKey: ["get-notifications", organizationId, page, limit],
    queryFn: async () => {
      const res = await api.get(`/api/notifications/${organizationId}`, {
        params: { page, limit },
      });
      return res.data;
    },
    enabled: !!organizationId,
  });
};
