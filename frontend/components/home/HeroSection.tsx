'use client';
import { Play, ArrowRight, Zap, Wand2 } from 'lucide-react';
import { Particles } from './Particles';
import { TypewriterHeadline } from './TypewriterHeadline';
import Link from 'next/link';

/* ── Animated code token: each token fades/slides in with a stagger ── */
function Token({ children, color, delay = 0 }: { children: React.ReactNode; color: string; delay?: number }) {
  return (
    <span
      style={{
        color,
        display: 'inline-block',
        animation: `token-fade 0.5s ease ${delay}ms both`,
      }}
    >
      {children}
    </span>
  );
}

/* ── A single code line that sweeps in ── */
function CodeLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ animation: `code-line-sweep 0.4s ease ${delay}ms both` }}>
      {children}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <Particles />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Eyebrow badge */}
        <div className="hero-animate inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-medium"
          style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)', color: '#2dd4bf' }}>
          <Zap className="w-3.5 h-3.5" />
          AI-powered code intelligence for engineering teams
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Headline */}
        <h1 className="hero-animate-1 text-5xl md:text-7xl font-bold font-mono mb-6 leading-[1.1] tracking-tight text-white">
          Your Team's Code<br />
          <span className="shimmer-text">Intelligence Hub</span>
        </h1>

        {/* Sub */}
        <p className="hero-animate-2 text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Organize snippets, collaborate in real-time, and let AI summarize, explain,
          and chat with your code — all in one vault.
        </p>

        {/* Typewriter */}
        <div className="hero-animate-3 mb-10 h-10 flex items-center justify-center">
          <TypewriterHeadline />
        </div>

        {/* CTAs */}
        <div className="hero-animate-4 flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href={'/signup'} className="px-8 py-4 teal-btn rounded-xl font-bold text-base flex items-center justify-center gap-2">
            Start Free — No Card Needed
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="px-8 py-4 outline-btn rounded-xl font-semibold text-base flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            Watch 2-min Demo
          </button>
        </div>

        {/* ── Hero Code Card ── */}
        <div className="hero-animate-5 relative mx-auto max-w-3xl card-bob">
          {/* glow ring */}
          <div className="absolute -inset-px rounded-2xl card-border-glow"
            style={{
              background: 'linear-gradient(135deg,rgba(20,184,166,0.2),rgba(6,182,212,0.1),rgba(99,102,241,0.1))',
              borderRadius: 16,
            }}
          />

          <div className="relative glass-card rounded-2xl p-6 md:p-8">
            {/* Traffic-light dots */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">snippet.js · code-vault</span>
            </div>

            {/* Code block with per-line + per-token animations */}
            <div className="code-block rounded-xl p-5 mb-4 font-mono text-sm text-left">
              <CodeLine delay={200}>
                <Token color="#818cf8" delay={220}>const</Token>
                <span className="text-zinc-500"> </span>
                <Token color="#2dd4bf" delay={280}>buildAmazing</Token>
                <Token color="#71717a" delay={320}> = </Token>
                <Token color="#818cf8" delay={360}>async</Token>
                <Token color="#a1a1aa" delay={400}> () </Token>
                <Token color="#71717a" delay={440}>=&gt; </Token>
                <Token color="#71717a" delay={480}>{'{'}</Token>
              </CodeLine>

              <CodeLine delay={550}>
                <span className="text-zinc-600 select-none ml-4">  </span>
                <Token color="#818cf8" delay={570}>const</Token>
                <Token color="#a1a1aa" delay={610}> result </Token>
                <Token color="#71717a" delay={640}>= </Token>
                <Token color="#818cf8" delay={670}>await </Token>
                <Token color="#14b8a6" delay={710}>codeVault</Token>
                <Token color="#71717a" delay={740}>.</Token>
                <Token color="#06b6d4" delay={770}>collaborate</Token>
                <Token color="#a1a1aa" delay={800}>()</Token>
                <Token color="#71717a" delay={820}>;</Token>
              </CodeLine>

              <CodeLine delay={880}>
                <span className="text-zinc-600 select-none ml-4">  </span>
                <Token color="#818cf8" delay={900}>return </Token>
                <Token color="#a1a1aa" delay={940}>result</Token>
                <Token color="#71717a" delay={970}>.</Token>
                <Token color="#06b6d4" delay={1000}>shipFaster</Token>
                <Token color="#a1a1aa" delay={1030}>()</Token>
                <Token color="#71717a" delay={1050}>;</Token>
              </CodeLine>

              <CodeLine delay={1100}>
                <Token color="#71717a" delay={1120}>{'}'}</Token>
                <Token color="#71717a" delay={1140}>;</Token>
              </CodeLine>
            </div>

            {/* AI response block */}
            <div className="rounded-xl p-4 text-left"
              style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)',
                       animation: 'chat-slide-in .5s ease 1.3s both' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded feature-icon-bg flex items-center justify-center">
                  <Wand2 className="w-3 h-3 text-teal-400 spin-slow" />
                </div>
                <p className="text-xs text-teal-500 font-mono font-semibold">AI Assistant</p>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                This async function initialises real-time collaboration and returns an optimised
                shipping pipeline. Uses Promise-based flow for non-blocking team sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
