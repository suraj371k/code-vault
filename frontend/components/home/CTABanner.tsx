"use client";
import { useProfile } from "@/hooks/auth/useProfile";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function CTABanner() {
  const { data: user } = useProfile();
  const { slug } = useParams();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%,rgba(20,184,166,.09) 0%,transparent 70%)",
        }}
      />

      <div
        className="max-w-3xl mx-auto text-center relative z-10"
        style={{ animation: "section-reveal .6s ease both" }}
      >
        <h2 className="text-4xl md:text-6xl font-bold font-mono text-white mb-4 leading-tight">
          Your team's code
          <br />
          deserves a <span className="shimmer-text">smarter home.</span>
        </h2>
        <p className="text-zinc-400 mb-10 text-lg">
          Join 500+ engineering teams building better, together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              className="px-8 py-4 teal-btn rounded-xl font-bold text-base flex items-center justify-center gap-2"
              href={`/organization/${slug}/dashboard`}
            >
              Dashboard
            </Link>
          ) : (
            <button className="px-8 py-4 teal-btn rounded-xl font-bold text-base flex items-center justify-center gap-2">
              Create Your Vault — It's Free
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button className="px-8 py-4 outline-btn rounded-xl font-semibold text-base flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Talk to Sales
          </button>
        </div>
      </div>
    </section>
  );
}
