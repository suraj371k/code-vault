import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserPlan = () => {
  return useQuery({
    queryKey: ["user-plan"],
    queryFn: async () => {
      const res = await api.get("/api/payment/plan");
      return res.data;
    },
  });
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: async (plan: "pro" | "enterprise") => {
      const res = await api.post("/api/payment/create-checkout-session", {
        plan,
      });

      return res.data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      console.error("Checkout error:", error.response?.data?.message);
    },
  });
};
