'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, FileText, GraduationCap, Folder, Settings, ArrowUpCircle, Sparkles } from 'lucide-react';

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
                ? "bg-indigo-50 text-indigo-700 font-semibold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        );
      })}
      
      {/* Premium Upsell in Sidebar */}
      <div className="p-4 mt-auto">
        <Link href="/dashboard/upgrade" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:shadow-sm transition-all group">
          <Sparkles className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-sm">Upgrade Plan</span>
        </Link>
      </div>
    </nav>
  );
}
