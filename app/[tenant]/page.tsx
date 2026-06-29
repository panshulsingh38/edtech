import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';

export default async function TenantPage({ params }: { params: { tenant: string } }) {
  const { tenant: subdomain } = await params;

  // 1. Fetch tenant data
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: { tests: true }
  });

  if (!tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Dynamic Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-nord-3" style={{ borderBottomColor: `${tenant.themeColor || '#4f46e5'}30` }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl border" style={{ backgroundColor: `${tenant.themeColor || '#4f46e5'}20`, borderColor: `${tenant.themeColor || '#4f46e5'}30` }}>
            <Building2 className="w-8 h-8" style={{ color: tenant.themeColor || '#4f46e5' }} />
          </div>
          <h1 className="text-2xl font-bold">{tenant.name} Learning Portal</h1>
        </div>
        <Link href="/auth/signin" className="px-6 py-2 rounded-lg font-bold" style={{ backgroundColor: tenant.themeColor || '#4f46e5', color: '#ffffff' }}>
          Student Login
        </Link>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-8 mt-12 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Welcome to the <span style={{ color: tenant.themeColor || '#4f46e5' }}>{tenant.name}</span> Assessment Platform
          </h2>
          <p className="text-nord-4 text-lg max-w-2xl mx-auto">
            Access your courses, complete assignments, and track your performance in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          {tenant.tests.map(test => (
            <div key={test.id} className="p-6 rounded-2xl bg-nord-1 border border-nord-3 hover:border-nord-3 transition-all flex flex-col h-full">
              <h3 className="text-xl font-bold mb-2">{test.title}</h3>
              <p className="text-nord-4 text-sm mb-6 flex-1">
                Required assessment assigned by {tenant.name} faculty.
              </p>
              <Link 
                href={`/test/${test.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                style={{ backgroundColor: `${tenant.themeColor || '#4f46e5'}20`, color: tenant.themeColor || '#4f46e5' }}
              >
                Start Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
          
          {tenant.tests.length === 0 && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-nord-3 rounded-2xl text-gray-500">
              No assessments are currently active for this institution.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
