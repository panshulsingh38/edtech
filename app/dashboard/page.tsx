import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Clock, FileText, Bookmark, ChevronDown, PlusCircle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Time-aware greeting
  const hour = new Date().getHours();
  let timeGreeting = 'Good evening';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  
  const userName = session?.user?.name?.split(' ')[0] || '';
  const greeting = userName ? `${timeGreeting}, ${userName}!` : `${timeGreeting}!`;

  let tests: any[] = [];
  let solutionLogs: any[] = [];

  if (session && session.user) {
    tests = await prisma.test.findMany({
      where: {
        // @ts-ignore
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { questions: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 4 // Get up to 4 recent tests
    });

    solutionLogs = await prisma.solutionLog.findMany({
      where: {
        // @ts-ignore
        userId: session.user.id
      },
      orderBy: { createdAt: 'desc' },
      take: 5 // Get recent activity
    });
  }

  const recentTests = tests.slice(0, 2);
  const upcomingTests = tests.slice(2, 4);

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Welcome Header & Quick Actions */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{greeting}</h1>
          <p className="text-slate-500 text-lg">Your learning dashboard is ready. Let's master something new.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Upload Document
          </button>
          <Link href="/">
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Generate Module
            </button>
          </Link>
        </div>
      </div>

      {/* Gamification Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-1">Learning Streak</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">3</span>
            <span className="text-orange-500 text-sm font-bold pb-1">🔥 Days</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-1">Modules Done</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">{tests.length}</span>
            <span className="text-slate-500 text-sm font-medium pb-1">Total</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-1">Minutes Today</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">45</span>
            <span className="text-slate-500 text-sm font-medium pb-1">Min</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium mb-1">Avg Quiz Score</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">82</span>
            <span className="text-emerald-500 text-sm font-bold pb-1">%</span>
          </div>
        </div>
      </div>

      {tests.length === 0 ? (
        /* Empty State Onboarding Card */
        <div className="bg-white border border-indigo-100 rounded-3xl p-10 shadow-sm text-center max-w-3xl mx-auto mt-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400"></div>
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to Aether Learning!</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">Turn your first document into an interactive study path in under 60 seconds. Follow these steps to get started:</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div className="text-sm text-slate-700 font-medium">Upload a<br/>document</div>
            </div>
            <div className="hidden md:block w-8 h-[1px] bg-slate-200"></div>
            <div className="flex items-start gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div className="text-sm text-slate-700 font-medium">Generate your<br/>first module</div>
            </div>
            <div className="hidden md:block w-8 h-[1px] bg-slate-200"></div>
            <div className="flex items-start gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div className="text-sm text-slate-700 font-medium">Take your<br/>first quiz</div>
            </div>
          </div>

          <Link href="/">
            <button className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
              Upload Your First Document ➔
            </button>
          </Link>
        </div>
      ) : (

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Continue Learning */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentTests.length > 0 ? (
                recentTests.map((test, index) => (
                  <div key={test.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-[180px] shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-slate-800 font-medium text-lg leading-tight line-clamp-2" title={test.title}>
                      {test.title}
                    </h3>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">{test._count.questions} Questions</span>
                        <span className="text-xs text-slate-400 font-medium">{formatDistanceToNow(new Date(test.createdAt))} ago</span>
                      </div>
                      <Link href={`/?testId=${test.id}`} className="block">
                        <button className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors">
                          Resume Lesson
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 bg-nord-1 border border-nord-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[180px]">
                  <p className="text-nord-4 mb-4">You haven't started any courses yet.</p>
                  <Link href="/">
                    <button className="px-6 py-2.5 bg-nord-14 hover:bg-[#b5d09f] text-nord-0 font-semibold rounded-xl transition-colors flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      Generate a New Course
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Assignments */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Assignments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingTests.length > 0 ? (
                upcomingTests.map((test) => (
                  <div key={test.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-[150px] shadow-sm">
                    <h3 className="text-slate-800 font-medium text-sm leading-tight line-clamp-2" title={test.title}>
                      {test.title}
                    </h3>
                    <div>
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-medium mb-3 inline-block">Due for review</span>
                      <p className="text-xs text-slate-400 font-medium mt-1">Created {formatDistanceToNow(new Date(test.createdAt))} ago</p>
                    </div>
                  </div>))
              ) : (
                <div className="col-span-1 sm:col-span-2 bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center h-[150px]">
                  <p className="text-sm text-slate-500 font-medium">No upcoming assignments.</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity (Bottom Left) */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              {solutionLogs.length > 0 ? (
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0 flex items-center justify-center font-bold">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-slate-800 text-sm"><span className="font-semibold">{userName}</span> answered a question</p>
                    <p className="text-slate-500 text-sm mt-1">{solutionLogs[0].isCorrect ? 'Correctly answered' : 'Attempted'} a question.</p>
                    <p className="text-slate-400 text-xs mt-2">{formatDistanceToNow(new Date(solutionLogs[0].createdAt))} ago</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No recent activity yet. Start taking tests to fill up your feed!</p>
              )}
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Recent Activity Timeline */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Activity Feed</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
              <div className="space-y-6">
                {solutionLogs.slice(0, 3).map((log, index) => (
                  <div key={log.id} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center z-10 shrink-0">
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                      {index !== solutionLogs.slice(0, 3).length - 1 && (
                        <div className="w-[1px] h-full bg-slate-200 absolute top-8 left-4"></div>
                      )}
                    </div>
                    <div className="pt-1 pb-6">
                      <p className="text-sm text-slate-700 font-medium mb-1">
                        Question Attempt
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(log.createdAt))} ago
                      </p>
                    </div>
                  </div>))}

                {solutionLogs.length === 0 && (
                   <p className="text-sm text-slate-500 relative z-10">Your feed is empty.</p>
                )}
              </div>
            </div>
          </section>

          {/* Recommended for You */}
              </div>

            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
