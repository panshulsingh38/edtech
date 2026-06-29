import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-electric-blue/30">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-electric-blue/20 rounded-xl border border-electric-blue/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed bg-glass-surface border border-glass-border p-8 md:p-12 rounded-3xl backdrop-blur-sm">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. We Respect Your Data (The TL;DR)</h2>
            <p>
              We built Aether Learning to help you study, not to sell your data. We do not sell your personal information to third parties. Period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. What Happens to Your Files?</h2>
            <p>
              When you upload a PDF, syllabus, or image (via Snap & Solve) to our platform:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Files are NOT saved:</strong> Your actual PDF files and images are processed in memory to extract text and are immediately discarded. We do not store your original files on our servers.</li>
              <li><strong>Extracted Text:</strong> We securely store the text extracted from your documents so you can access your generated flashcards and tests later.</li>
              <li><strong>AI Processing:</strong> We send the extracted text to our AI partners (Google) strictly for the purpose of generating your study materials. Your data is not used to train public AI models.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Information We Collect</h2>
            <p>
              If you create an account, we collect your email address and profile name via Google Authentication. This is strictly used to save your generated tests, track your XP and streaks, and manage your Pro subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Payment Information</h2>
            <p>
              All payments are securely processed by Razorpay. We do not see, collect, or store your credit card numbers or bank details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Deleting Your Data</h2>
            <p>
              You own your data. If you wish to permanently delete your account, your study history, and all associated text, you can contact us at any time, and we will wipe it from our database immediately.
            </p>
          </section>

          <p className="text-sm text-zinc-500 mt-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
