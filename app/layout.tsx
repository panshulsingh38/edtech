import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aether Learning | Turn Any Document into an Interactive Study Path",
  description: "Upload your PDFs, notes, or lecture slides. Our AI instantly generates personalized flashcards, practice quizzes, and interactive modules to help you master the material.",
  openGraph: {
    title: "Aether Learning | Turn Any Document into an Interactive Study Path",
    description: "Upload your PDFs, notes, or lecture slides. Our AI instantly generates personalized flashcards, practice quizzes, and interactive modules to help you master the material.",
    url: "https://aetherlearning.com",
    siteName: "Aether Learning",
    images: [
      {
        url: "/distillation-pod.png",
        width: 1200,
        height: 630,
        alt: "Aether Learning Distillation Pod",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether Learning",
    description: "Turn Any Document into an Interactive Study Path",
    images: ["/distillation-pod.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aether Learning"
  },
  icons: {
    apple: "/apple-icon.png"
  }
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
