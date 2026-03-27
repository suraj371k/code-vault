'use client';
import { useState, useEffect } from 'react';
import { Lock, Menu, X, ArrowRight, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProfile } from '@/hooks/auth/useProfile';
import { useLogout } from '@/hooks/auth/useLogout';
import { useOrganizations } from '@/hooks/organization/useOrganizations';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

const NAV_LINKS = ['Features', 'FAQ', 'Pricing'];

export function Navbar() {
  const [sticky, setSticky]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: organizations } = useOrganizations();
  const { mutate: logout, isPending: logoutPending } = useLogout();
  const firstOrgSlug = organizations?.[0]?.slug;

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success('Logged out successfully');
        router.push('/');
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Logout failed. Please try again.');
      },
    });
  };

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
            {profile ? (
              <>
                <Link
                  href={firstOrgSlug ? `/organization/${firstOrgSlug}/dashboard` : '/organization/create'}
                  className="px-4 py-2 text-sm outline-btn rounded-lg"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3 border border-teal-500/20 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800/70 hover:text-zinc-100 focus-visible:text-zinc-100 data-[state=open]:text-zinc-100"
                    >
                      <User className="w-4 h-4 text-zinc-300" />
                      <span className="max-w-36 truncate text-sm">{profile.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 border border-white/10 bg-[#161616] text-zinc-100"
                  >
                    <DropdownMenuLabel className="py-2">
                      <p className="text-sm font-medium truncate">{profile.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{profile.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => router.push('/settings')}
                        className="cursor-pointer text-zinc-200 focus:bg-white/10 focus:text-zinc-100"
                      >
                        <Settings className="w-4 h-4 text-zinc-300" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-950/30"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      {logoutPending ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href={'/login'} className="px-4 py-2 text-sm outline-btn rounded-lg">Sign In</Link>
                <Link href={'/signup'} className="px-4 py-2 text-sm teal-btn rounded-lg flex items-center gap-1.5">
                  Get Started Free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
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
              {profile ? (
                <>
                  <div className="rounded-lg border border-teal-500/20 bg-zinc-900/40 p-3">
                    <p className="text-sm text-zinc-100 truncate">{profile.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{profile.email}</p>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        firstOrgSlug
                          ? `/organization/${firstOrgSlug}/dashboard`
                          : '/organization/create'
                      )
                    }
                    className="w-full px-4 py-2 outline-btn rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full px-4 py-2 outline-btn rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-950/30"
                  >
                    <LogOut className="w-4 h-4" />
                    {logoutPending ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full px-4 py-2 outline-btn rounded-lg text-sm text-center">Sign In</Link>
                  <Link href="/signup" className="w-full px-4 py-2 teal-btn rounded-lg text-sm text-center">Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
