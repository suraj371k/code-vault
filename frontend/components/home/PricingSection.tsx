"use client";
import { useState } from "react";
import { Check } from "lucide-react";

const PRICING = {
  monthly: [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      popular: false,
      cta: "Get Started Free",
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
      cta: "Contact Sales",
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
  yearly: [
    {
      name: "Free",
      price: "$0",
      period: "/year",
      popular: false,
      cta: "Get Started Free",
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
      price: "$96",
      period: "/year",
      popular: true,
      cta: "Start Pro Trial",
      savings: "Save 20%",
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
      price: "$240",
      period: "/year",
      popular: false,
      cta: "Contact Sales",
      savings: "Save 20%",
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
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const plans = PRICING[cycle];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3 font-mono"
            style={{ animation: "section-reveal .5s ease both" }}
          >
            Pricing
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold font-mono mb-4 text-white"
            style={{ animation: "section-reveal .5s ease .1s both" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className="text-zinc-400 mb-8"
            style={{ animation: "section-reveal .5s ease .2s both" }}
          >
            Choose the perfect plan for your team
          </p>

          {/* Toggle */}
          <div
            className="inline-flex rounded-xl p-1"
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(20,184,166,.15)",
              animation: "section-reveal .5s ease .3s both",
            }}
          >
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize
                  ${cycle === c ? "teal-btn" : "text-zinc-400 hover:text-white"}`}
              >
                {c}
                {c === "yearly" && (
                  <span className="ml-1 text-xs opacity-70">−20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300
                ${plan.popular ? "popular-card md:-mt-4 md:mb-4" : "glass-card hover:border-teal-500/30"}`}
              style={{
                animation: `section-reveal .5s ease ${idx * 100}ms both`,
              }}
            >
              {/* popular top stripe */}
              {plan.popular && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background:
                      "linear-gradient(90deg,rgba(20,184,166,.8),rgba(6,182,212,.8))",
                  }}
                />
              )}
              {plan.popular && (
                <div
                  className="text-center py-2 text-xs font-bold tracking-wider text-teal-400 font-mono"
                  style={{ background: "rgba(20,184,166,.08)" }}
                >
                  ★ MOST POPULAR
                </div>
              )}

              <div className="p-8">
                <h3 className="text-xl font-bold text-white mb-1 font-mono">
                  {plan.name}
                </h3>
                <div className="mb-6 flex items-end gap-1">
                  <span className="text-4xl font-bold stat-number font-mono">
                    {plan.price}
                  </span>
                  <span className="text-zinc-500 text-sm pb-1">
                    {plan.period}
                  </span>
                  {"savings" in plan && plan.savings && (
                    <span className="ml-2 text-xs font-bold text-teal-400 pb-1">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 mb-8
                  ${plan.popular ? "teal-btn" : "outline-btn"}`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feat, fi) => (
                    <div key={fi} className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: "rgba(20,184,166,.15)" }}
                      >
                        <Check className="w-2.5 h-2.5 text-teal-400" />
                      </div>
                      <span className="text-xs text-zinc-400">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
