'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-400 mb-12">Last updated: April 8, 2026</p>

          <div className="space-y-8 text-gray-300">
            <section className="glass glass-hover rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">🔒 Your Privacy Matters</h2>
              <p className="mb-4">
                At HarshAI, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Name, email address, password</li>
                <li><strong>Payment Information:</strong> Processed securely by Paddle (we don't store card details)</li>
                <li><strong>Usage Data:</strong> Workflow creations, integrations used, feature usage</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain the HarshAI service</li>
                <li>Process payments and send invoices</li>
                <li>Send service updates and important notifications</li>
                <li>Improve our product based on usage patterns</li>
                <li>Provide customer support</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Data Storage and Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Encrypted database storage</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Secure payment processing via Paddle (PCI DSS compliant)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
              <p className="mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Paddle:</strong> Payment processing (paddle.com)</li>
                <li><strong>Clerk:</strong> Authentication and user management (clerk.com)</li>
                <li><strong>Vercel:</strong> Hosting and deployment (vercel.com)</li>
                <li><strong>AI Providers:</strong> OpenAI, Anthropic, ElevenLabs (only when you use these integrations)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
              <p className="mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Export your workflows and data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies</h2>
              <p className="mb-4">
                We use cookies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintain your session</li>
                <li>Remember your preferences</li>
                <li>Analyze site usage (Google Analytics)</li>
                <li>Improve user experience</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Active accounts:</strong> As long as your account is active</li>
                <li><strong>Deleted accounts:</strong> 90 days after deletion</li>
                <li><strong>Payment records:</strong> 7 years (legal requirement)</li>
                <li><strong>Analytics data:</strong> 26 months</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
              <p className="mb-4">
                HarshAI is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the new policy on this page</li>
                <li>Sending an email notification</li>
                <li>Updating the "Last updated" date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
              <p className="mb-4">
                For privacy-related questions, please contact:
              </p>
              <div className="glass rounded-xl p-6 border border-white/10">
                <p className="text-white mb-2"><strong>Email:</strong> privacy@harshai.com</p>
                <p className="text-white"><strong>Address:</strong> Harshal Lahare, India</p>
                <p className="text-gray-400 text-sm mt-4">
                  We respond to all privacy inquiries within 48 hours.
                </p>
              </div>
            </section>

            <section className="glass glass-hover rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">🛡️ Data Protection Officer</h2>
              <p className="text-gray-300">
                For EU residents: You have the right to lodge a complaint with a data protection authority if you believe our processing of your data violates applicable law.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
