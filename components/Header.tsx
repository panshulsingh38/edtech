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
    <header className="w-full border-b border-nord-3 bg-[#13131a]/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full group-hover:bg-blue-400/40 transition-colors" />
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 relative z-10 text-blue-400">
              <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 10L6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Aether<span className="text-blue-400">Learning</span></span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link 
            href="/"
            className={pathname === '/' 
              ? "text-white px-3 py-2 text-sm font-medium transition-colors" 
              : "text-nord-4 hover:text-white px-3 py-2 text-sm font-medium transition-colors"}
          >
            New Test
          </Link>
          <Link 
            href="/dashboard"
            className={pathname?.startsWith('/dashboard') 
              ? "flex items-center gap-2 bg-nord-8/20 border border-nord-8/30 text-nord-8 px-4 py-2 rounded-full text-sm font-medium transition-all" 
              : "flex items-center gap-2 bg-nord-1/50 hover:bg-nord-2/50 border border-nord-3 text-nord-5 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all"}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-nord-1/50 hover:bg-nord-2/50 border border-nord-3 text-nord-5 hover:text-white transition-all ml-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
