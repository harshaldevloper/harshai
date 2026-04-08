'use client';

import Link from 'next/link';

export default function TermsPage() {
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
            Terms and Conditions
          </h1>
          <p className="text-gray-400 mb-12">Last updated: April 8, 2026</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using HarshAI (https://ai-workflow-automator.vercel.app), you accept and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">
                HarshAI is an AI workflow automation platform that connects 52+ AI tools into automated workflows. The service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Visual workflow builder</li>
                <li>AI integrations (ChatGPT, Claude, ElevenLabs, etc.)</li>
                <li>Test Mode for testing without API keys</li>
                <li>Workflow execution and automation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p className="mb-4">
                You must create an account to use HarshAI. You are responsible for maintaining the security of your account and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Subscription and Billing</h2>
              <p className="mb-4">
                HarshAI offers the following subscription plans:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Free:</strong> $0/month - Limited workflows and integrations</li>
                <li><strong>Pro:</strong> $29/month or $290/year - Unlimited workflows, all integrations</li>
                <li><strong>Enterprise:</strong> $99/month - Team features, custom integrations</li>
              </ul>
              <p className="mt-4">
                All paid plans include a 14-day free trial. Billing is handled securely through Paddle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Cancellation and Refunds</h2>
              <p className="mb-4">
                You may cancel your subscription at any time from your dashboard. Refunds are processed according to our Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Acceptable Use</h2>
              <p className="mb-4">
                You agree not to use HarshAI for any illegal or unauthorized purpose. You agree to comply with all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="mb-4">
                HarshAI and its original content, features, and functionality are owned by Harshal Lahare and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="mb-4">
                HarshAI is provided "as is" and "as available" without warranties of any kind, either express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">
                HarshAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="text-white">
                Email: support@harshai.com<br />
                Website: https://ai-workflow-automator.vercel.app/contact
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
