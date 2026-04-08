"use client";
import { Navbar } from "../components/home/Navbar";
import { HeroSection } from "../components/home/HeroSection";
import { StatsBar } from "../components/home/StatsBar";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { AIDemoSection } from "../components/home/AIDemoSection";
import { PricingSection } from "../components/home/PricingSection";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import { FAQSection } from "../components/home/FAQSection";
import { CTABanner } from "../components/home/CTABanner";
import { Footer } from "../components/home/Footer";

function Divider() {
  return <div className="section-divider" />;
}

export default function Home() {
  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#000" }}
    >
      <div className="fixed inset-0 pointer-events-none grid-bg" />
      <div
        className="fixed inset-0 pointer-events-none glow-orb-1"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%,rgba(20,184,166,.18) 0%,transparent 70%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none glow-orb-2"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 10% 90%,rgba(6,182,212,.10) 0%,transparent 70%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none glow-orb-3"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 90% 80%,rgba(99,102,241,.07) 0%,transparent 70%)",
        }}
      />

      {/* ── Sections ── */}
      <Navbar />
      <HeroSection />
      <Divider />
      <StatsBar />
      <Divider />
      <FeaturesSection />
      <Divider />
      <HowItWorksSection />
      <Divider />
      <AIDemoSection />
      <Divider />
      <PricingSection />
      <Divider />
      <TestimonialsSection />
      <Divider />
      <FAQSection />
      <Divider />
      <CTABanner />
      <Divider />
      <Footer />
    </div>
  );
}
