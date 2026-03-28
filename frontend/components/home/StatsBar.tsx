'use client';

const STATS = [
  { value: '500+',  label: 'Engineering Teams' },
  { value: '2M+',   label: 'Snippets Stored'   },
  { value: '99.9%', label: 'Uptime SLA'        },
  { value: '10x',   label: 'Faster Onboarding' },
];

export function StatsBar() {
  return (
    <section className="py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="glass-card rounded-xl p-5 hover:scale-105 transition-transform duration-300"
            style={{ animation: `section-reveal 0.5s ease ${i * 100}ms both` }}
          >
            <p className="text-3xl font-bold font-mono stat-number mb-1">{s.value}</p>
            <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
