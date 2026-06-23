import { prisma } from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, BookOpen, FileText } from 'lucide-react';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// This is a Server Component. It runs on the server and fetches directly from the DB.
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 pt-12 text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <Link href="/auth/signin" className="px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition">Sign In</Link>
      </div>
    );
  }

  const tests = await prisma.test.findMany({
    where: {
      // @ts-ignore
      userId: session.user.id
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: {
        select: { questions: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-6 pt-12 pb-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
          My Tests
        </h1>
        <p className="text-xl text-gray-400">Review your past generated study materials.</p>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-2">No tests found</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">Upload a PDF document to generate your first Magic Test!</p>
          <Link 
            href="/"
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
          >
            Create a Test
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Link 
              key={test.id} 
              href={`/?testId=${test.id}`}
              className="group block p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{test.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{test._count.questions} questions</span>
                <span>•</span>
                <span>{formatDistanceToNow(test.createdAt, { addSuffix: true })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
