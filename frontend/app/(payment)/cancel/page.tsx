"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useOrganizations } from "@/hooks/organization/useOrganizations";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function CancelPage() {
  const router = useRouter();
  const { data: orgs, isPending } = useOrganizations();
  const [seconds, setSeconds] = useState(5);

  const getBillingSlug = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lastPaidOrgSlug");
      if (saved) return saved;
    }
    return orgs?.[0]?.slug ?? null;
  };

  useEffect(() => {
    if (isPending || !orgs?.length) return;

    const slug = getBillingSlug();
    if (!slug) return;

    const countdown = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(countdown);
          localStorage.removeItem("lastPaidOrgSlug");
          router.push(`/organization/${slug}/dashboard/billing`);
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [orgs, isPending, router]);

  const billingSlug = !isPending ? getBillingSlug() : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "#060609",
        backgroundImage: `
          linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(239,68,68,0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-3xl border p-8 text-center space-y-6"
        style={{
          background: "rgba(10,10,15,0.95)",
          borderColor: "rgba(239,68,68,0.2)",
          boxShadow:
            "0 0 60px rgba(239,68,68,0.08), 0 0 0 1px rgba(239,68,68,0.06)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="flex items-center justify-center mx-auto size-20 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(248,113,113,0.1))",
            boxShadow: "0 0 40px rgba(239,68,68,0.2)",
            border: "1.5px solid rgba(239,68,68,0.3)",
          }}
        >
          <XCircle className="size-10 text-red-400" strokeWidth={1.5} />
        </motion.div>

        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-2xl font-bold text-white"
          >
            Payment Cancelled
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="text-sm text-zinc-400 leading-relaxed"
          >
            No charge was made. You can upgrade your plan anytime from the
            billing page.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <p className="text-xs text-zinc-500">
            {isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" /> Loading...
              </span>
            ) : (
              <>
                Redirecting back in{" "}
                <span className="text-red-400 font-semibold">{seconds}s</span>
              </>
            )}
          </p>

          {billingSlug && (
            <button
              onClick={() => {
                localStorage.removeItem("lastPaidOrgSlug");
                router.push(`/organization/${billingSlug}/dashboard/billing`);
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: "rgba(239,68,68,0.12)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <ArrowLeft className="size-4" />
              Back to Billing
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
