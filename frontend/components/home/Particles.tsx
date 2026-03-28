'use client';

import { useEffect, useState } from 'react';

const COLORS = ['rgba(20,184,166,0.85)', 'rgba(6,182,212,0.65)', 'rgba(99,102,241,0.55)'];

type Particle = {
  size: number;
  color: string;
  left: string;
  top: string;
  dur: number;
  delay: number;
};

export function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        size:  Math.random() * 3 + 1,
        color: COLORS[i % 3],
        left:  `${Math.random() * 100}%`,
        top:   `${Math.random() * 100}%`,
        dur:   6 + Math.random() * 9,
        delay: Math.random() * 6,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width:      p.size,
            height:     p.size,
            background: p.color,
            left:       p.left,
            top:        p.top,
            opacity:    0,
            animation:  `float-particle ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}