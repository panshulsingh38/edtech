import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import SidebarNav from '@/components/SidebarNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  const userName = session?.user?.name || 'Guest User';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f8fafc] flex flex-col hidden md:flex shrink-0">
        <div className="p-6 h-20 flex items-center">
          <Link href="/" className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-indigo-600">▲</span> AetherLearning
          </Link>
        </div>

        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white rounded-tl-3xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border-l border-t border-slate-200 min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md rounded-tl-3xl flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search courses or topics..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-indigo-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              {session?.user?.image ? (
                <img src={session.user.image} alt={userName} className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm group-hover:bg-indigo-200 transition-colors">
                  {initials}
                </div>
              )}
              <span className="text-slate-700 font-medium text-sm group-hover:text-indigo-600 transition-colors">{userName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#fdfdfd] p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
