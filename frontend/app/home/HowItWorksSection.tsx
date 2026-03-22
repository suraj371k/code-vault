'use client';
import { Save, Users, Wand2 } from 'lucide-react';

const STEPS = [
  { step: '01', title: 'Create',         desc: 'Add a snippet to your vault with tags, language, and description.', icon: Save  },
  { step: '02', title: 'Collaborate',    desc: 'Share with your team, add to collections, chat in real-time.',       icon: Users },
  { step: '03', title: 'Amplify with AI',desc: 'Get instant summaries, ask questions, and get explanations.',        icon: Wand2 },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3 font-mono"
           style={{ animation: 'section-reveal .5s ease both' }}>
          The Flow
        </p>
        <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4 text-white"
            style={{ animation: 'section-reveal .5s ease .1s both' }}>
          From Snippet to Intelligence
        </h2>
        <p className="text-zinc-400 mb-16"
           style={{ animation: 'section-reveal .5s ease .2s both' }}>
          Three simple steps to productivity
        </p>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px"
               style={{ background: 'linear-gradient(90deg,rgba(20,184,166,.5),rgba(6,182,212,.5))' }} />

          {STEPS.map((item, idx) => (
            <div key={idx} className="relative"
                 style={{ animation: `section-reveal 0.5s ease ${idx * 120}ms both` }}>
              <div className="glass-card rounded-2xl p-8 hover:scale-105 transition-transform duration-300 group">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center
                                feature-icon-bg group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-5xl font-bold text-teal-500/20 font-mono mb-3">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2
                               group-hover:text-teal-300 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
