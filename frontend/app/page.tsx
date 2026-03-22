'use client';
import { Navbar }              from './home/Navbar';
import { HeroSection }         from './home/HeroSection';
import { StatsBar }            from './home/StatsBar';
import { FeaturesSection }     from './home/FeaturesSection';
import { HowItWorksSection }   from './home/HowItWorksSection';
import { AIDemoSection }       from './home/AIDemoSection';
import { PricingSection }      from './home/PricingSection';
import { TestimonialsSection } from './home/TestimonialsSection';
import { FAQSection }          from './home/FAQSection';
import { CTABanner }           from './home/CTABanner';
import { Footer }              from './home/Footer';

function Divider() {
  return <div className="section-divider" />;
}

export default function Home() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#000' }}>

      {/* ── Fixed background layers (match snippet page) ── */}
      <div className="fixed inset-0 pointer-events-none grid-bg" />
      <div className="fixed inset-0 pointer-events-none glow-orb-1"
           style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(20,184,166,.18) 0%,transparent 70%)' }} />
      <div className="fixed inset-0 pointer-events-none glow-orb-2"
           style={{ background: 'radial-gradient(ellipse 50% 40% at 10% 90%,rgba(6,182,212,.10) 0%,transparent 70%)' }} />
      <div className="fixed inset-0 pointer-events-none glow-orb-3"
           style={{ background: 'radial-gradient(ellipse 40% 35% at 90% 80%,rgba(99,102,241,.07) 0%,transparent 70%)' }} />

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
