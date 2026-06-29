import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Clock, FileText, Bookmark, ChevronDown, PlusCircle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Use session name if available, else fallback
  const userName = session?.user?.name?.split(' ')[0] || 'Guest';

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
              {recentTests.length > 0 ? (
                recentTests.map((test, index) => (
                  <div key={test.id} className="bg-nord-1 border border-nord-2 rounded-2xl p-5 flex flex-col justify-between h-[180px]">
                    <h3 className="text-white font-medium text-lg leading-tight line-clamp-2" title={test.title}>
                      {test.title}
                    </h3>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-nord-4 font-medium">{test._count.questions} Questions</span>
                        <span className="text-xs text-nord-3">{formatDistanceToNow(new Date(test.createdAt))} ago</span>
                      </div>
                      <Link href={`/${test.id}`} className="block">
                        <button className="w-full py-2.5 bg-nord-14 hover:bg-[#b5d09f] text-nord-0 font-semibold rounded-xl transition-colors">
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
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming Assignments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingTests.length > 0 ? (
                upcomingTests.map((test) => (
                  <div key={test.id} className="bg-nord-1 border border-nord-2 rounded-2xl p-5 flex flex-col justify-between h-[140px]">
                    <div>
                      <h3 className="text-white font-medium line-clamp-1" title={test.title}>{test.title}</h3>
                      <p className="text-xs text-nord-4 mt-1">Ready to review</p>
                    </div>
                    <p className="text-sm text-nord-4">Created {formatDistanceToNow(new Date(test.createdAt))} ago</p>
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 bg-nord-1 border border-nord-2 rounded-2xl p-5 flex items-center justify-center h-[140px]">
                  <p className="text-sm text-nord-4">No upcoming assignments.</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity (Bottom Left) */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-nord-1 border border-nord-2 rounded-2xl p-6">
              {solutionLogs.length > 0 ? (
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-nord-9 flex-shrink-0 flex items-center justify-center text-nord-0 font-bold">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm"><span className="font-semibold">{userName}</span> answered a question</p>
                    <p className="text-nord-4 text-sm mt-1">{solutionLogs[0].isCorrect ? 'Correctly answered' : 'Attempted'} a question.</p>
                    <p className="text-nord-4 text-xs mt-2">{formatDistanceToNow(new Date(solutionLogs[0].createdAt))} ago</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-nord-4">No recent activity yet. Start taking tests to fill up your feed!</p>
              )}
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Recent Activity Timeline */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Activity Feed</h2>
            <div className="bg-nord-1 border border-nord-2 rounded-2xl p-6 relative">
              
              {/* Timeline line */}
              <div className="absolute left-[39px] top-8 bottom-12 w-[1px] bg-nord-3"></div>
              
              <div className="space-y-6">
                {solutionLogs.slice(0, 3).map((log, idx) => (
                  <div key={log.id} className="flex gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-nord-2 border border-nord-3 flex items-center justify-center flex-shrink-0">
                      {log.isCorrect ? (
                        <FileText className="w-4 h-4 text-nord-14" />
                      ) : (
                        <Clock className="w-4 h-4 text-nord-11" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white"><span className="font-medium">Question Attempt</span></p>
                      <p className="text-xs text-nord-4 mt-1">{formatDistanceToNow(new Date(log.createdAt))} ago</p>
                    </div>
                  </div>
                ))}

                {solutionLogs.length === 0 && (
                   <p className="text-sm text-nord-4 relative z-10">Your feed is empty.</p>
                )}
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
