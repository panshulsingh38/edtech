import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Clock, FileText, Bookmark, ChevronDown } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Use session name if available, else fallback
  const userName = session?.user?.name?.split(' ')[0] || 'Jane';

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {userName}!</h1>
        <p className="text-nord-4 text-lg">Your learning dashboard is ready for your late-night study session.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Continue Learning */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-nord-1 border border-nord-2 rounded-2xl p-5 flex flex-col justify-between h-[180px]">
                <h3 className="text-white font-medium text-lg leading-tight">React.js Advanced</h3>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-2 flex-1 bg-nord-0 rounded-full overflow-hidden mr-4">
                      <div className="h-full bg-nord-14 w-[75%] rounded-full"></div>
                    </div>
                    <span className="text-sm text-nord-4 font-medium">75%</span>
                  </div>
                  <button className="w-full py-2.5 bg-nord-14 hover:bg-[#b5d09f] text-nord-0 font-semibold rounded-xl transition-colors">
                    Resume Lesson
                  </button>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-nord-1 border border-nord-2 rounded-2xl p-5 flex flex-col justify-between h-[180px]">
                <h3 className="text-white font-medium text-lg leading-tight">Intro to Python Data<br/>Structures</h3>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-2 flex-1 bg-nord-0 rounded-full overflow-hidden mr-4">
                      <div className="h-full bg-nord-14 w-[40%] rounded-full opacity-70"></div>
                    </div>
                    <span className="text-sm text-nord-4 font-medium">40%</span>
                  </div>
                  <button className="w-full py-2.5 bg-nord-14 hover:bg-[#b5d09f] text-nord-0 font-semibold rounded-xl transition-colors opacity-90">
                    Resume Lesson
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Upcoming Assignments */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming Assignments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-nord-1 border border-nord-2 rounded-2xl p-5 flex flex-col justify-between h-[140px]">
                <div>
                  <h3 className="text-white font-medium">History Essay</h3>
                  <p className="text-xs text-nord-4 mt-1">(Due Tomorrow)</p>
                </div>
                <p className="text-sm text-nord-4">2 hours ago</p>
              </div>
              
              <div className="bg-nord-1 border border-nord-2 rounded-2xl p-5 flex flex-col justify-between h-[140px]">
                <div>
                  <h3 className="text-white font-medium">Algorithm Design Quiz</h3>
                  <p className="text-xs text-nord-4 mt-1">(Due in 3 Days)</p>
                </div>
                <p className="text-sm text-nord-4">3 hours Days</p>
              </div>
            </div>
          </section>

          {/* Recent Activity (Bottom Left) */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-nord-1 border border-nord-2 rounded-2xl p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-nord-9 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm"><span className="font-semibold">{userName} Doe</span> is achoined</p>
                  <p className="text-nord-4 text-sm mt-1">History Essay writen for like Structures</p>
                  <p className="text-nord-4 text-xs mt-2">12 hours ago</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Recent Activity Timeline */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-nord-1 border border-nord-2 rounded-2xl p-6 relative">
              
              {/* Timeline line */}
              <div className="absolute left-[39px] top-8 bottom-12 w-[1px] bg-nord-3"></div>
              
              <div className="space-y-6">
                <div className="flex gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-nord-2 border border-nord-3 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-nord-8" />
                  </div>
                  <div>
                    <p className="text-sm text-white"><span className="font-medium">Feed</span> {userName} Doe.</p>
                    <p className="text-xs text-nord-4 mt-1">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-nord-2 border border-nord-3 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-nord-8" />
                  </div>
                  <div>
                    <p className="text-sm text-white leading-tight">Assignment to Itane<br/>continue Learning.</p>
                    <p className="text-xs text-nord-4 mt-1">3 hours ago</p>
                  </div>
                </div>

                <div className="flex gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-nord-2 border border-nord-3 flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-4 h-4 text-nord-8" />
                  </div>
                  <div>
                    <p className="text-sm text-white leading-tight">Declined time strategy to<br/>conishimeme writing.</p>
                    <p className="text-xs text-nord-4 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recommended for You */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Recommended for You</h2>
            <div className="bg-nord-1 border border-nord-2 rounded-2xl p-4 space-y-4">
              
              <div className="flex gap-4 p-2 hover:bg-nord-2 rounded-xl transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-nord-8 flex-shrink-0 opacity-80"></div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Digital Marketing<br/>Fundamentals</h3>
                  <p className="text-[10px] text-nord-4 mt-1 leading-tight">Digital Marketing<br/>Fundamentals and<br/>courses.</p>
                </div>
              </div>

              <div className="w-full h-[1px] bg-nord-2"></div>

              <div className="flex gap-4 p-2 hover:bg-nord-2 rounded-xl transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-nord-14 flex-shrink-0 opacity-80"></div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Creative Writing<br/>Workshop</h3>
                  <p className="text-[10px] text-nord-4 mt-1 leading-tight">As of Creative Writing<br/>Workshop</p>
                </div>
              </div>

              <div className="w-full h-[1px] bg-nord-2"></div>

              <div className="flex gap-4 p-2 hover:bg-nord-2 rounded-xl transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-nord-10 flex-shrink-0 opacity-80"></div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Creative Writing<br/>Workshop</h3>
                </div>
              </div>

            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
