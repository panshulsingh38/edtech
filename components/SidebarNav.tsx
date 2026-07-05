'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, FileText, GraduationCap, Folder, Settings, ArrowUpCircle } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
    { href: '/dashboard/assignments', label: 'Assignments', icon: FileText },
    { href: '/dashboard/grades', label: 'Grades', icon: GraduationCap },
    { href: '/dashboard/resources', label: 'Resources', icon: Folder },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="flex-1 px-4 py-4 space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        // Exact match for dashboard, prefix match for others to keep active state if nested
        const isActive = link.href === '/dashboard' 
          ? pathname === '/dashboard' 
          : pathname?.startsWith(link.href);

        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? "bg-nord-2 text-nord-14 font-medium" 
                : "text-nord-4 hover:bg-nord-2 hover:text-nord-6"
            }`}
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        );
      })}
      
      <div className="pt-8 pb-4">
        <Link 
          href="/dashboard/upgrade"
          className={`flex items-center justify-between px-4 py-3 rounded-xl border border-nord-14/30 bg-nord-14/10 text-nord-14 hover:bg-nord-14 hover:text-nord-0 font-bold transition-all ${
            pathname === '/dashboard/upgrade' ? "bg-nord-14 text-nord-0" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="w-5 h-5" />
            Upgrade Plan
          </div>
        </Link>
      </div>
    </nav>
  );
}
