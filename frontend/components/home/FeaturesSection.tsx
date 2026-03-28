'use client';
import { Users, Save, Folder, MessageSquare, Wand2, Code, Star, Globe } from 'lucide-react';

const FEATURES = [
  { icon: Users,        title: 'Org Management',    desc: 'Create orgs, invite members, set roles and permissions.',        color: '#14b8a6' },
  { icon: Globe,        title: 'Team Collaboration', desc: 'Add users, form teams, manage access at snippet level.',          color: '#06b6d4' },
  { icon: Save,         title: 'Smart Storage',      desc: 'Tag, categorize, search across thousands of snippets.',           color: '#818cf8' },
  { icon: Folder,       title: 'Collections',        desc: 'Group related snippets into curated, shareable sets.',            color: '#34d399' },
  { icon: MessageSquare,title: 'Team Chat',          desc: 'Real-time messaging per team with threaded conversations.',       color: '#14b8a6' },
  { icon: Wand2,        title: 'AI Chatbot',         desc: 'Ask AI anything: debug, explain, refactor — instantly.',         color: '#06b6d4' },
  { icon: Star,         title: 'AI Summary',         desc: 'Auto-generates a plain-English summary on snippet creation.',    color: '#f59e0b' },
  { icon: Code,         title: 'Chat With Code',     desc: 'Select any snippet and have a full AI conversation about it.',   color: '#818cf8' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3 font-mono"
             style={{ animation: 'section-reveal .5s ease both' }}>
            What's Inside
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4 text-white"
              style={{ animation: 'section-reveal .5s ease .1s both' }}>
            Everything Your Team Needs
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto"
             style={{ animation: 'section-reveal .5s ease .2s both' }}>
            Powerful features designed for modern development teams.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-6 group cursor-default"
              style={{ animation: `section-reveal 0.5s ease ${idx * 60}ms both` }}
            >
              <div className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center feature-icon-bg
                              group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm
                             group-hover:text-teal-300 transition-colors duration-200">
                {f.title}
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
