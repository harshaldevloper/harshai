'use client';

import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
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
            <Link href="/product" className="text-white font-semibold">Product</Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 min-h-screen flex items-center px-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent text-center animate-gradient neon-glow">
            HarshAI Pro
          </h1>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Your Complete AI Command Center
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Connect 52+ AI tools into automated workflows. No code required. Build once, automate forever.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✅</span>
                  52+ AI Integrations (ChatGPT, Claude, ElevenLabs, etc.)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✅</span>
                  Visual Workflow Builder - Drag & Drop
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✅</span>
                  Test Mode - Try Before You Buy
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✅</span>
                  No Code Required
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✅</span>
                  14-Day Free Trial
                </li>
              </ul>
            </div>

            <div className="glass glass-hover rounded-3xl p-8 border border-white/10 animate-float">
              <div className="text-6xl mb-4 text-center">🤖</div>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">AI Integration</div>
                  <div className="text-white font-semibold">ChatGPT + Claude + ElevenLabs</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">Workflow</div>
                  <div className="text-white font-semibold">Auto-generate content → Post to all platforms</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">Time Saved</div>
                  <div className="text-white font-semibold">10+ hours/week</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-200 btn-shine animate-pulse-glow"
            >
              Start 14-Day Free Trial →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
