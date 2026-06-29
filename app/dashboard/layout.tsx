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
    <div className="min-h-screen bg-nord-0 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-nord-0 border-r border-nord-1 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 h-20 flex items-center">
          <Link href="/" className="text-xl font-bold text-nord-6 flex items-center gap-2">
            <span className="text-nord-8">▲</span> AetherLearning
          </Link>
        </div>

        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-nord-1 rounded-tl-2xl shadow-2xl min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-nord-2 bg-nord-1 rounded-tl-2xl flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-nord-3" />
              <input 
                type="text"
                placeholder="Search courses or topics..."
                className="w-full bg-nord-0 border border-nord-2 rounded-xl py-3 pl-12 pr-4 text-nord-6 placeholder-nord-4 focus:outline-none focus:border-nord-14 transition-colors text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-nord-4 hover:text-nord-11 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-nord-11 rounded-full border border-nord-1"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              {session?.user?.image ? (
                <img src={session.user.image} alt={userName} className="w-9 h-9 rounded-full object-cover border border-nord-2" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-nord-14 flex items-center justify-center text-nord-0 font-bold text-sm">
                  {initials}
                </div>
              )}
              <span className="text-nord-6 font-medium text-sm">{userName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
