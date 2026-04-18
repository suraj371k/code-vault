import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useHasToken } from "@/hooks/useHasToken";

// Type definitions
type Plan = "FREE" | "PRO" | "ENTERPRISE";

interface OrganizationPlanResponse {
  success: boolean;
  data: {
    plan: Plan;
    status: string;
    expiresAt: string | null;
    isActive: boolean;
    isTrialing: boolean;
    isCanceled: boolean;
    isPastDue: boolean;
    organizationId: number;
    organizationName: string;
    limits: {
      organizations: number;
      snippetsPerOrg: number;
      membersPerOrg: number;
    };
    usage?: {
      members: { current: number; limit: number; percentage: number };
      snippets: { current: number; limit: number; percentage: number };
    };
  };
}

interface CheckoutResponse {
  success: boolean;
  url: string;
}

interface PaymentActionResponse {
  success: boolean;
  message: string;
  data?: {
    organizationId: number;
    plan: Plan;
    status: string;
    expiresAt?: string | null;
  };
}

export const useOrganizationPlan = (organizationId?: number) => {
  const hasToken = useHasToken();

  return useQuery({
    queryKey: ["org-plan", organizationId],
    queryFn: async (): Promise<OrganizationPlanResponse> => {
      const res = await api.get(
        `/api/payment/plan?organizationId=${organizationId}`
      );
      return res.data;
    },
    // Fire only when token is present AND organizationId is a valid positive number
    enabled:
      hasToken &&
      !!organizationId &&
      !isNaN(organizationId) &&
      organizationId > 0,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for checkout mutation
export const useCheckout = () => {
  return useMutation({
    mutationFn: async ({
      plan,
      organizationId,
    }: {
      plan: Exclude<Plan, "FREE">;
      organizationId: number;
    }) => {
      if (!organizationId || isNaN(organizationId) || organizationId <= 0) {
        throw new Error(
          "Organization not loaded yet. Please wait and try again."
        );
      }
      if (!plan || (plan !== "PRO" && plan !== "ENTERPRISE")) {
        throw new Error("Valid plan (PRO or ENTERPRISE) is required");
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("You must be logged in to purchase a plan.");
      }

      const res = await api.post<CheckoutResponse>(
        "/api/payment/create-checkout-session",
        { plan, organizationId }
      );

      return res.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("No checkout URL received from server.");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message || err.message || "Checkout failed";
      toast.error(message);
    },
  });
};

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: async ({ organizationId }: { organizationId: number }) => {
      if (!organizationId || isNaN(organizationId)) {
        throw new Error("Organization ID is required");
      }

      const res = await api.post<PaymentActionResponse>(
        "/api/payment/cancel-subscription",
        { organizationId }
      );

      return res.data;
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel subscription";
      toast.error(message);
    },
  });
};

export const useUpgradePlan = () => {
  return useMutation({
    mutationFn: async ({
      plan,
      organizationId,
    }: {
      plan: Exclude<Plan, "FREE">;
      organizationId: number;
    }) => {
      const res = await api.put(
        `/api/organizations/${organizationId}/upgrade`,
        { plan }
      );
      return res.data;
    },
  });
};
