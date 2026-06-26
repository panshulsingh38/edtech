import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    const formData = await req.formData();
    const examDateStr = formData.get('examDate') as string;

    if (!examDateStr) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    const examDate = new Date(examDateStr);

    await prisma.user.update({
      // @ts-ignore
      where: { id: session.user.id },
      data: { examDate }
    });

    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Error setting exam date:', error);
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}
