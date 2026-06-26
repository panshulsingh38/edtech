'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="w-full border-b border-white/10 bg-[#13131a]/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Magic<span className="text-indigo-400">Test</span></span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link 
            href="/"
            className={pathname === '/' 
              ? "text-white px-3 py-2 text-sm font-medium transition-colors" 
              : "text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"}
          >
            New Test
          </Link>
          <Link 
            href="/dashboard"
            className={pathname?.startsWith('/dashboard') 
              ? "flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium transition-all" 
              : "flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all"}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all ml-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
