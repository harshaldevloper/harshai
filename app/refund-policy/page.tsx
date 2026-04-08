'use client';

import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-12 h-12" />
            <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              HarshAI
            </span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 px-6 pt-20 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <p className="text-gray-400 mb-12">Last updated: April 8, 2026</p>

          <div className="space-y-8 text-gray-300">
            <section className="glass glass-hover rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">🎯 Our Commitment</h2>
              <p className="mb-4">
                We want you to be completely satisfied with HarshAI. That's why we offer a **14-day free trial** on all paid plans - no credit card required to start.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Free Trial</h2>
              <p className="mb-4">
                All paid plans (Pro and Enterprise) include a 14-day free trial. During this period, you have full access to all features without any charge.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No credit card required to start trial</li>
                <li>Full access to all features</li>
                <li>Cancel anytime during trial - no charge</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Refund Eligibility</h2>
              <p className="mb-4">
                After the 14-day trial, refunds are available under the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Within 30 days of purchase:</strong> Full refund if you're not satisfied</li>
                <li><strong>Technical issues:</strong> Full refund if we cannot resolve critical bugs</li>
                <li><strong>Duplicate charges:</strong> Full refund for any billing errors</li>
                <li><strong>After 30 days:</strong> Pro-rated refund based on unused time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Non-Refundable Items</h2>
              <p className="mb-4">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Free plan subscriptions</li>
                <li>Usage after 30 days without prior contact</li>
                <li>Violations of Terms and Conditions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. How to Request a Refund</h2>
              <p className="mb-4">
                To request a refund, please contact us at:
              </p>
              <div className="glass rounded-xl p-6 border border-white/10">
                <p className="text-white mb-2"><strong>Email:</strong> support@harshai.com</p>
                <p className="text-white mb-2"><strong>Subject:</strong> Refund Request - [Your Account Email]</p>
                <p className="text-gray-400 text-sm">
                  Please include your account email and reason for the refund request. We process all refund requests within 5-7 business days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Refund Processing Time</h2>
              <p className="mb-4">
                Approved refunds will be processed within 5-7 business days. The refund will be issued to the original payment method.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Credit/Debit cards: 5-10 business days</li>
                <li>PayPal: 3-5 business days</li>
                <li>Other payment methods: 7-14 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cancellation</h2>
              <p className="mb-4">
                You can cancel your subscription at any time from your dashboard. After cancellation:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You retain access until the end of your billing period</li>
                <li>No further charges will be made</li>
                <li>Your data will be retained for 90 days</li>
              </ul>
            </section>

            <section className="glass glass-hover rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">❓ Questions?</h2>
              <p className="mb-4">
                If you have any questions about our refund policy, please contact us:
              </p>
              <p className="text-white">
                Email: support@harshai.com<br />
                Contact Form: https://ai-workflow-automator.vercel.app/contact
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
