'use client';

/* Floating teal/cyan/indigo particles for the hero background */
export function Particles() {
  const particles = Array.from({ length: 22 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((_, i) => {
        const size   = Math.random() * 3 + 1;
        const colors = ['rgba(20,184,166,0.85)', 'rgba(6,182,212,0.65)', 'rgba(99,102,241,0.55)'];
        const color  = colors[i % 3];
        const dur    = 6 + Math.random() * 9;
        const delay  = Math.random() * 6;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width:  size,
              height: size,
              background: color,
              left: `${Math.random() * 100}%`,
              top:  `${Math.random() * 100}%`,
              opacity: 0,
              animation: `float-particle ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
