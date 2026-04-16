"use client";

import { useOrganizations } from "@/hooks/organization/useOrganizations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const { data: orgs, isPending } = useOrganizations();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (isPending || !orgs?.length) return;
    const slug = orgs[0].slug;

    const countdown = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(countdown);
          router.push(`/organization/${slug}/dashboard/billing`);
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [orgs, isPending, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "#060609",
        backgroundImage: `
          linear-gradient(rgba(20,184,166,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20,184,166,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      {/* Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(20,184,166,0.13) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-3xl border p-8 text-center space-y-6"
        style={{
          background: "rgba(10,10,15,0.95)",
          borderColor: "rgba(20,184,166,0.2)",
          boxShadow: "0 0 60px rgba(20,184,166,0.12), 0 0 0 1px rgba(20,184,166,0.08)",
        }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="flex items-center justify-center mx-auto size-20 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(45,212,191,0.1))",
            boxShadow: "0 0 40px rgba(20,184,166,0.3)",
            border: "1.5px solid rgba(20,184,166,0.35)",
          }}
        >
          <CheckCircle2 className="size-10 text-teal-400" strokeWidth={1.5} />
        </motion.div>

        {/* Text */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-2xl font-bold text-white"
          >
            Payment Successful!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="text-sm text-zinc-400 leading-relaxed"
          >
            Your organization's subscription has been activated. You now have
            access to all features included in your plan.
          </motion.p>
        </div>

        {/* Sparkle badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 flex-wrap"
        >
          {["Unlimited Snippets", "Team Collaboration", "AI Features"].map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full"
              style={{ background: "rgba(20,184,166,0.1)", color: "#2dd4bf" }}
            >
              <Sparkles className="size-3" />
              {f}
            </span>
          ))}
        </motion.div>

        {/* Redirect info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <p className="text-xs text-zinc-500">
            {isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" /> Loading...
              </span>
            ) : (
              <>Redirecting to your dashboard in <span className="text-teal-400 font-semibold">{seconds}s</span></>
            )}
          </p>

          {orgs?.[0]?.slug && (
            <button
              onClick={() =>
                router.push(`/organization/${orgs[0].slug}/dashboard/billing`)
              }
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #0f766e, #0d9488)",
                color: "#ccfbf1",
                boxShadow: "0 0 18px rgba(20,184,166,0.3)",
              }}
            >
              Go to Dashboard
              <ArrowRight className="size-4" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
