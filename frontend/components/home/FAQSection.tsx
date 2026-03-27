'use client';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  { q:'Can I use Code-Vault for free?',
    a:'Yes! Our Free plan includes 1 organization, up to 3 users, and 50 snippets — no credit card required.' },
  { q:'How does AI snippet summarization work?',
    a:'When you upload a snippet our AI analyses your code and generates a plain-English summary instantly, understanding context, intent, and purpose.' },
  { q:'Can I chat with AI about my own code?',
    a:'Absolutely! Select any snippet and start a conversation. Ask questions, get debugging help, or explore refactoring options.' },
  { q:'Is there a team size limit on the Pro plan?',
    a:'The Pro plan supports up to 20 users across 3 organizations. For larger teams, Enterprise offers unlimited users and admin controls.' },
  { q:'Does Code-Vault support all programming languages?',
    a:'Yes! All major languages including JavaScript, TypeScript, Python, Java, C++, Go, Rust, Ruby and more — with full syntax highlighting.' },
];

export function FAQSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3 font-mono"
             style={{ animation:'section-reveal .5s ease both' }}>FAQ</p>
          <h2 className="text-4xl md:text-5xl font-bold font-mono text-white"
              style={{ animation:'section-reveal .5s ease .1s both' }}>
            Frequently Asked
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <details key={idx}
              className="glass-card rounded-xl p-6 cursor-pointer group hover:border-teal-500/30 transition-colors duration-200"
              style={{ animation:`section-reveal .5s ease ${idx*80}ms both` }}>
              <summary className="flex items-center justify-between font-semibold text-white text-sm
                                   select-none list-none group-hover:text-teal-300 transition-colors duration-200">
                <span>{item.q}</span>
                <ChevronDown className="w-4 h-4 text-teal-400 flex-shrink-0 chevron" />
              </summary>
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
