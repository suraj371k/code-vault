import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useHasToken } from "@/hooks/useHasToken";

// ── Types ────────────────────────────────────────────────────────────────────
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
  subscriptionId: string;
  keyId: string;
  prefill: { email: string; name: string };
  organizationName: string;
}

interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
  organizationId: number;
  plan: Exclude<Plan, "FREE">;
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

// ── Razorpay script loader (loads SDK once) ──────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Open Razorpay Modal ───────────────────────────────────────────────────────
// Accepts checkout data from backend and opens the Razorpay payment modal.
// Calls onSuccess with payment fields on success, onDismiss if user closes.
export function openRazorpayModal({
  checkoutData,
  organizationId,
  plan,
  onSuccess,
  onDismiss,
}: {
  checkoutData: CheckoutResponse;
  organizationId: number;
  plan: Exclude<Plan, "FREE">;
  onSuccess: (fields: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}) {
  const options = {
    key: checkoutData.keyId,
    subscription_id: checkoutData.subscriptionId,
    name: "CodeSnippet",
    description: `${plan === "PRO" ? "Pro Plan — $10/month" : "Enterprise Plan — $25/month"}`,
    image: "/logo.png", // optional — add your logo to /public/logo.png
    prefill: {
      email: checkoutData.prefill.email,
      name: checkoutData.prefill.name,
    },
    notes: {
      organizationId: String(organizationId),
      plan: plan.toLowerCase(),
    },
    theme: {
      color: "#0d9488", // teal to match your UI
    },
    modal: {
      ondismiss: () => {
        onDismiss?.();
      },
    },
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }) => {
      onSuccess(response);
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}

// ── useOrganizationPlan ──────────────────────────────────────────────────────
export const useOrganizationPlan = (organizationId?: number) => {
  const hasToken = useHasToken();

  return useQuery({
    queryKey: ["org-plan", organizationId],
    queryFn: async (): Promise<OrganizationPlanResponse> => {
      const res = await api.get(`/api/payment/plan?organizationId=${organizationId}`);
      return res.data;
    },
    enabled:
      hasToken &&
      !!organizationId &&
      !isNaN(organizationId) &&
      organizationId > 0,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

// ── useCheckout ───────────────────────────────────────────────────────────────
// Step 1: Creates a Razorpay subscription on the backend.
// Step 2: Loads Razorpay SDK and opens the payment modal.
// Step 3: On payment success, calls /verify-payment on the backend.
export const useCheckout = () => {
  return useMutation({
    mutationFn: async ({
      plan,
      organizationId,
      onVerified,
    }: {
      plan: Exclude<Plan, "FREE">;
      organizationId: number;
      onVerified?: () => void;
    }) => {
      if (!organizationId || isNaN(organizationId) || organizationId <= 0) {
        throw new Error("Organization not loaded yet. Please wait and try again.");
      }
      if (!plan || (plan !== "PRO" && plan !== "ENTERPRISE")) {
        throw new Error("Valid plan (PRO or ENTERPRISE) is required");
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("You must be logged in to purchase a plan.");
      }

      // Step 1 — create subscription on backend
      const res = await api.post<CheckoutResponse>(
        "/api/payment/create-checkout-session",
        { plan, organizationId },
      );
      const checkoutData = res.data;

      if (!checkoutData.subscriptionId) {
        throw new Error("No subscription ID received from server.");
      }

      // Step 2 — load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your connection.");
      }

      // Step 3 — open modal; resolve/reject based on outcome
      return new Promise<void>((resolve, reject) => {
        openRazorpayModal({
          checkoutData,
          organizationId,
          plan,
          onSuccess: async (paymentFields) => {
            try {
              // Step 4 — verify payment signature on backend
              await api.post("/api/payment/verify-payment", {
                ...paymentFields,
                organizationId,
                plan,
              } as VerifyPaymentPayload);

              onVerified?.();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          onDismiss: () => {
            reject(new Error("Payment cancelled"));
          },
        });
      });
    },
    onSuccess: () => {
      toast.success("🎉 Subscription activated successfully!");
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message || "Checkout failed";
      // Don't show toast for user-initiated cancel
      if (message !== "Payment cancelled") {
        toast.error(message);
      }
    },
  });
};

// ── useCancelSubscription ─────────────────────────────────────────────────────
export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: async ({ organizationId }: { organizationId: number }) => {
      if (!organizationId || isNaN(organizationId)) {
        throw new Error("Organization ID is required");
      }

      const res = await api.post<PaymentActionResponse>(
        "/api/payment/cancel-subscription",
        { organizationId },
      );

      return res.data;
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message || err.message || "Failed to cancel subscription";
      toast.error(message);
    },
  });
};

// ── useUpgradePlan ────────────────────────────────────────────────────────────
export const useUpgradePlan = () => {
  return useMutation({
    mutationFn: async ({
      plan,
      organizationId,
    }: {
      plan: Exclude<Plan, "FREE">;
      organizationId: number;
    }) => {
      const res = await api.put(`/api/organizations/${organizationId}/upgrade`, { plan });
      return res.data;
    },
  });
};
