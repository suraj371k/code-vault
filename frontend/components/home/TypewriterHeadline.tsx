'use client';
import { useEffect, useState } from 'react';

/* ── Real typewriter: types forward then deletes ── */
function useTyping(texts: string[], speed = 80, pause = 2200) {
  const [display, setDisplay] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    const delay = deleting ? speed / 2 : speed;
    const t = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setTextIdx(i => (i + 1) % texts.length);
          setCharIdx(0);
        } else setCharIdx(c => c - 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return display;
}

export function TypewriterHeadline() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const typed = useTyping(['Store Snippets.', 'Share with Teams.', 'Chat with AI.', 'Ship Faster.']);
  return (
    <p className="text-2xl font-mono text-teal-400">
      {mounted ? typed : 'Store Snippets.'}
      <span className="cursor-blink ml-0.5 text-teal-300">|</span>
    </p>
  );
}
