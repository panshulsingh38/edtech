import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

// Hardcoded Admin Emails
const ADMIN_EMAILS = [
  "panshulsingh38@outlook.com",
  "panshulsingh38@gmail.com"
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = user.id;
        
        // Dynamically assign ADMIN role if email matches
        if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
          // @ts-ignore
          session.user.role = 'ADMIN';
        } else {
          // @ts-ignore
          session.user.role = (user as any).role;
        }
        // @ts-ignore
        session.user.insights = (user as any).insights ?? 0;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};
