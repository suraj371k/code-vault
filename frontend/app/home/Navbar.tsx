'use client';
import { useState, useEffect } from 'react';
import { Lock, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NAV_LINKS = ['Features', 'FAQ', 'Pricing'];

export function Navbar() {
  const [sticky, setSticky]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${sticky ? 'nav-glass' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg feature-icon-bg flex items-center justify-center">
              <Lock className="w-4 h-4 text-teal-400" />
            </div>
            <span className="font-mono text-lg font-bold shimmer-text">{'{code-vault}'}</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex gap-8">
            {NAV_LINKS.map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-zinc-400 hover:text-teal-400 transition-colors duration-200 text-sm font-medium">
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex gap-3 items-center">
            <Link href={'/login'} className="px-4 py-2 text-sm outline-btn rounded-lg">Sign In</Link>
            <Link href={'/signup'} className="px-4 py-2 text-sm teal-btn rounded-lg flex items-center gap-1.5">
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-zinc-400 hover:text-teal-400 transition-colors"
            onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 border-t border-teal-500/10 pt-4">
            {NAV_LINKS.map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="block text-zinc-400 hover:text-teal-400 transition-colors text-sm">
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <button className="w-full px-4 py-2 outline-btn rounded-lg text-sm">Sign In</button>
              <button className="w-full px-4 py-2 teal-btn rounded-lg text-sm">Get Started Free</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
