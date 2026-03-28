'use client';
import { Lock } from 'lucide-react';

const FOOTER_LINKS = [
  { title:'Product',   links:['Features','Pricing','Security','Roadmap'] },
  { title:'Company',   links:['About','Blog','Careers','Contact'] },
  { title:'Resources', links:['Docs','API','Community','Support'] },
  { title:'Legal',     links:['Privacy','Terms','Cookies','Compliance'] },
];

export function Footer() {
  return (
    <footer className="py-14 px-4 sm:px-6 lg:px-8" style={{ background:'rgba(0,0,0,.5)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-teal-400" />
              <span className="font-mono font-bold shimmer-text text-sm">{'{code-vault}'}</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Your team's code intelligence hub. Built for developers who care.
            </p>
          </div>

          {FOOTER_LINKS.map(sec => (
            <div key={sec.title}>
              <h4 className="text-white font-semibold text-xs mb-4 tracking-wide">{sec.title}</h4>
              <ul className="space-y-2">
                {sec.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-xs text-zinc-600 hover:text-teal-400 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8" style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">© 2025 Code-Vault · Privacy Policy · Terms of Service</p>
            <div className="flex gap-5">
              {['GitHub','Twitter','LinkedIn','Discord'].map(s => (
                <a key={s} href="#" className="text-xs text-zinc-600 hover:text-teal-400 transition-colors duration-200">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
