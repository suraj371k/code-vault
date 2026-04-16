"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const plans = {
  monthly: [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      popular: false,
      cta: "Get Started Free",
      planId: null,
      features: [
        "1 Organization",
        "Up to 3 Users",
        "50 Snippets",
        "Basic Collections",
        "Community Support",
      ],
    },
    {
      name: "Pro",
      price: "$10",
      period: "/month",
      popular: true,
      cta: "Start Pro Trial",
      planId: "pro",
      features: [
        "3 Organizations",
        "Up to 20 Users",
        "Unlimited Snippets",
        "AI Summaries (100/month)",
        "AI Chat with Snippets",
        "Team Chat",
        "Priority Support",
      ],
    },
    {
      name: "Enterprise",
      price: "$25",
      period: "/month",
      popular: false,
      cta: "Upgrade to Enterprise",
      planId: "enterprise",
      features: [
        "Unlimited Organizations",
        "Unlimited Users",
        "Unlimited Snippets",
        "Unlimited AI Features",
        "Custom Collections",
        "Dedicated AI Chatbot",
        "SSO & Advanced Permissions",
        "24/7 Dedicated Support",
      ],
    },
  ],
} as const;

export function PricingSection() {
  const slug = useParams();

  const router = useRouter();
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3 font-mono">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4 text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-zinc-400 mb-8">
            Choose the perfect plan for your team
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.monthly.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden border border-white/10 p-8 transition
                ${
                  plan.popular
                    ? "border-teal-500 scale-105"
                    : "hover:border-teal-500/30"
                }`}
            >
              {plan.popular && (
                <div className="text-center mb-4 text-xs font-bold text-teal-400">
                  ★ MOST POPULAR
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>

              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-zinc-500 text-sm pb-1">
                  {plan.period}
                </span>
              </div>

              {/* UI ONLY BUTTON */}
              <button
                onClick={() =>
                  router.push(`/organization/${slug}/dashboard/billing`)
                }
                className={`w-full py-3 rounded-xl font-bold text-sm mb-8 transition
                  ${
                    plan.popular
                      ? "bg-teal-500 text-white"
                      : "border border-white/20 text-white hover:bg-white/10"
                  }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3">
                {plan.features.map((feat, fi) => (
                  <div key={fi} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-teal-500/20 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-teal-400" />
                    </div>
                    <span className="text-xs text-zinc-400">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
