'use client';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  { name:'Sarah Chen',    role:'Engineering Lead', company:'TechFlow',   initials:'SC', color:'#14b8a6',
    quote:'Code-Vault transformed how our team manages shared code patterns. The AI features alone save us hours every week.' },
  { name:'James Wilson',  role:'CTO',              company:'DevHQ',      initials:'JW', color:'#06b6d4',
    quote:'Finally, a snippet tool that understands our workflow. Real-time collaboration is incredibly seamless.' },
  { name:'Emma Rodriguez',role:'Tech Lead',         company:'BuildWorks', initials:'ER', color:'#818cf8',
    quote:'The AI chat feature is incredible. Our team uses it for everything from debugging to architecture decisions.' },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3 font-mono"
             style={{ animation:'section-reveal .5s ease both' }}>Social Proof</p>
          <h2 className="text-4xl md:text-5xl font-bold font-mono text-white"
              style={{ animation:'section-reveal .5s ease .1s both' }}>
            What Teams Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx}
              className="glass-card rounded-2xl p-7 hover:scale-[1.03] transition-all duration-300 group"
              style={{ animation:`section-reveal .5s ease ${idx*120}ms both` }}>
              {/* stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({length:5}).map((_,i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400
                                           group-hover:scale-110 transition-transform duration-200"
                        style={{ transitionDelay:`${i*40}ms` }} />
                ))}
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black
                                group-hover:scale-110 transition-transform duration-300"
                     style={{ background:t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm
                                group-hover:text-teal-300 transition-colors duration-200">{t.name}</p>
                  <p className="text-zinc-500 text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
