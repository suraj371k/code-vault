"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useUserPlan, useCheckout } from "@/hooks/payment/usePayment";
import { useOrganizations } from "@/hooks/organization/useOrganizations";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Zap,
  Building2,
  Sparkles,
  Crown,
  AlertCircle,
  Clock,
  ShieldCheck,
  Star,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

/* ─── types ─── */
type PlanKey = "FREE" | "PRO" | "ENTERPRISE";

interface PlanConfig {
  key: PlanKey;
  label: string;
  price: number | null;
  period: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  glowColor: string;
  borderActive: string;
  features: string[];
  limit: string;
  badge?: string;
}

const PLANS: PlanConfig[] = [
  {
    key: "FREE",
    label: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for individuals & small teams getting started.",
    icon: Star,
    iconColor: "#6b7280",
    glowColor: "rgba(107,114,128,0.18)",
    borderActive: "rgba(107,114,128,0.4)",
    features: [
      "Up to 3 team members",
      "50 code snippets",
      "Basic collections",
      "Community support",
    ],
    limit: "3 members · 50 snippets",
  },
  {
    key: "PRO",
    label: "Pro",
    price: 10,
    period: "month",
    description: "For growing teams that need more power and collaboration.",
    icon: Zap,
    iconColor: "#2dd4bf",
    glowColor: "rgba(20,184,166,0.2)",
    borderActive: "rgba(20,184,166,0.45)",
    features: [
      "Up to 20 team members",
      "Unlimited snippets",
      "Advanced collections",
      "Priority email support",
      "AI-powered summaries",
      "Team messaging",
    ],
    limit: "20 members · Unlimited snippets",
    badge: "Popular",
  },
  {
    key: "ENTERPRISE",
    label: "Enterprise",
    price: 25,
    period: "month",
    description: "For large organizations needing full control & scale.",
    icon: Crown,
    iconColor: "#f59e0b",
    glowColor: "rgba(245,158,11,0.18)",
    borderActive: "rgba(245,158,11,0.4)",
    features: [
      "Unlimited team members",
      "Unlimited snippets",
      "Custom collections",
      "Dedicated support",
      "Advanced AI features",
      "SSO & audit logs",
      "SLA guarantee",
    ],
    limit: "Unlimited members & snippets",
  },
];

/* ─── status helpers ─── */
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "rgba(20,184,166,0.12)", text: "#2dd4bf", label: "Active" },
  past_due: { bg: "rgba(239,68,68,0.12)", text: "#f87171", label: "Past Due" },
  canceled: { bg: "rgba(107,114,128,0.12)", text: "#9ca3af", label: "Canceled" },
  free: { bg: "rgba(107,114,128,0.12)", text: "#9ca3af", label: "Free Tier" },
};

function getStatus(plan: PlanKey, status?: string) {
  if (plan === "FREE") return STATUS_STYLES.free;
  return STATUS_STYLES[status ?? "active"] ?? STATUS_STYLES.active;
}

/* ══════════════════════════════
   COMPONENT
══════════════════════════════ */
export default function BillingPage() {
  const { slug } = useParams();
  const { data: orgs } = useOrganizations();
  const { data: planData, isLoading: planLoading } = useUserPlan();
  const [confirmPlan, setConfirmPlan] = useState<"pro" | "enterprise" | null>(null);

  const currentSlug = Array.isArray(slug) ? slug[0] : slug;
  const activeOrg = orgs?.find((o) => o.slug === currentSlug);
  const organizationId = activeOrg?.id ?? planData?.organizationId ?? 0;

  const { mutate: checkout, isPending: checkoutPending } = useCheckout(organizationId);

  const currentPlan = (planData?.plan ?? "FREE") as PlanKey;
  const subscriptionStatus = planData?.status;
  const expiresAt = planData?.expiresAt ? new Date(planData.expiresAt) : null;

  const statusStyle = getStatus(currentPlan, subscriptionStatus);

  function handleUpgrade(planKey: PlanKey) {
    if (planKey === "FREE" || planKey === currentPlan) return;
    const planArg = planKey.toLowerCase() as "pro" | "enterprise";
    setConfirmPlan(planArg);
  }

  function confirmCheckout() {
    if (!confirmPlan) return;
    checkout(confirmPlan, {
      onError: () => toast.error("Failed to create checkout session. Try again."),
    });
  }

  /* loading skeleton */
  if (planLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-7 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Subscription</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your organization's plan, usage, and subscription.
        </p>
      </motion.div>

      {/* ── Current Plan Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.05 }}
        className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{
          background: "rgba(20,184,166,0.04)",
          borderColor: "rgba(20,184,166,0.18)",
          boxShadow: "0 0 30px rgba(20,184,166,0.06)",
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center size-12 rounded-xl shrink-0"
          style={{
            background: "linear-gradient(135deg, #0f766e, #0d9488)",
            boxShadow: "0 0 18px 4px rgba(20,184,166,0.3)",
          }}
        >
          <Building2 className="size-5 text-teal-100" strokeWidth={1.8} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-white">{activeOrg?.name ?? "Your Organization"}</span>
            <Badge
              className="text-xs px-2 py-0.5 border-0"
              style={{ background: statusStyle.bg, color: statusStyle.text }}
            >
              {statusStyle.label}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">
            Current plan:{" "}
            <span className="font-semibold text-white">{currentPlan}</span>
            {expiresAt && (
              <span className="ml-2 text-zinc-500 text-xs inline-flex items-center gap-1">
                <Clock className="size-3" />
                Renews {expiresAt.toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        {/* Shield badge */}
        <div className="flex items-center gap-1.5 text-xs text-teal-600 shrink-0">
          <ShieldCheck className="size-4" />
          Secured by Stripe
        </div>
      </motion.div>

      {/* ── Plans Grid ── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Choose a Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.key === currentPlan;
            const isUpgrade =
              plan.key !== "FREE" && plan.key !== currentPlan && !(currentPlan === "ENTERPRISE" && plan.key === "PRO");

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.1 + i * 0.07 }}
                className="relative rounded-2xl border p-5 flex flex-col"
                style={{
                  background: isCurrentPlan
                    ? `linear-gradient(140deg, ${plan.glowColor} 0%, rgba(0,0,0,0.6) 100%)`
                    : "rgba(255,255,255,0.02)",
                  borderColor: isCurrentPlan ? plan.borderActive : "rgba(255,255,255,0.07)",
                  boxShadow: isCurrentPlan ? `0 0 30px ${plan.glowColor}` : "none",
                  transition: "box-shadow 0.3s, border-color 0.3s",
                }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #0f766e, #0d9488)",
                      color: "#ccfbf1",
                      boxShadow: "0 0 12px rgba(20,184,166,0.4)",
                    }}
                  >
                    {plan.badge}
                  </span>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex items-center justify-center size-9 rounded-xl"
                    style={{
                      background: `${plan.glowColor}`,
                      boxShadow: `0 0 12px ${plan.glowColor}`,
                    }}
                  >
                    <Icon className="size-4" style={{ color: plan.iconColor }} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{plan.label}</p>
                    <p className="text-[10px] text-zinc-500">{plan.limit}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-white">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-sm text-zinc-500 ml-1">/ {plan.period}</span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{plan.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-300">
                      <Check
                        className="size-3.5 mt-0.5 shrink-0"
                        style={{ color: plan.iconColor }}
                        strokeWidth={2.5}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: plan.glowColor,
                      color: plan.iconColor,
                    }}
                  >
                    <Sparkles className="size-3.5" />
                    Current Plan
                  </div>
                ) : isUpgrade ? (
                  <Button
                    className="w-full text-xs font-semibold rounded-xl py-2 border-0 cursor-pointer"
                    style={{
                      background:
                        plan.key === "ENTERPRISE"
                          ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.08))"
                          : "linear-gradient(135deg, #0f766e, #0d9488)",
                      color: plan.key === "ENTERPRISE" ? "#fbbf24" : "#ccfbf1",
                      boxShadow:
                        plan.key === "PRO" ? "0 0 14px rgba(20,184,166,0.3)" : "none",
                    }}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={checkoutPending}
                  >
                    {checkoutPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      `Upgrade to ${plan.label}`
                    )}
                  </Button>
                ) : (
                  <div
                    className="flex items-center justify-center py-2 rounded-xl text-xs font-medium text-zinc-600"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {currentPlan === "ENTERPRISE" ? "Highest plan" : "Downgrade"}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Subscription Info ── */}
      {currentPlan !== "FREE" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.3 }}
          className="rounded-2xl border p-5 space-y-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="text-sm font-semibold text-white">Subscription Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Plan", value: currentPlan },
              { label: "Status", value: statusStyle.label },
              {
                label: "Next Renewal",
                value: expiresAt ? expiresAt.toLocaleDateString() : "—",
              },
              { label: "Billing", value: "Monthly" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          <div
            className="flex items-start gap-2 rounded-xl p-3 mt-2"
            style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.12)" }}
          >
            <AlertCircle className="size-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              To cancel or change your subscription, please manage it through your Stripe
              customer portal. Cancellations take effect at the end of the current billing period.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Confirm Modal ── */}
      <AnimatePresence>
        {confirmPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-sm rounded-2xl border p-6 space-y-5"
              style={{
                background: "#0d0d12",
                borderColor: "rgba(20,184,166,0.2)",
                boxShadow: "0 0 40px rgba(20,184,166,0.1)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center size-10 rounded-xl"
                  style={{ background: "rgba(20,184,166,0.12)" }}
                >
                  <Zap className="size-5 text-teal-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white capitalize">
                    Upgrade to {confirmPlan}
                  </p>
                  <p className="text-xs text-zinc-500">
                    You'll be redirected to Stripe to complete payment.
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Your subscription will start immediately after payment. You can cancel anytime
                before the next billing cycle.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-xs rounded-xl border-zinc-800 text-zinc-400 hover:text-white bg-transparent"
                  onClick={() => setConfirmPlan(null)}
                  disabled={checkoutPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 text-xs rounded-xl border-0"
                  style={{
                    background: "linear-gradient(135deg, #0f766e, #0d9488)",
                    color: "#ccfbf1",
                    boxShadow: "0 0 14px rgba(20,184,166,0.3)",
                  }}
                  onClick={confirmCheckout}
                  disabled={checkoutPending}
                >
                  {checkoutPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Continue to Stripe"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
