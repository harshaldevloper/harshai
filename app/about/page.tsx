'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            HarshAI
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-white font-semibold">About</Link>
            <Link href="/use-cases" className="text-gray-300 hover:text-white transition-colors">Use Cases</Link>
            <Link href="/demo" className="text-gray-300 hover:text-white transition-colors">Demo</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 min-h-screen flex items-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            About HarshAI
          </h1>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 mb-12">
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              HarshAI is the ultimate AI automation platform for creators, entrepreneurs, and businesses.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              We believe everyone should have access to powerful AI tools without needing to write a single line of code.
            </p>
            <p className="text-lg text-gray-400">
              Founded by Harshal Lahare, HarshAI brings 50+ AI tools together in one beautiful platform.
              Build automated workflows in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '50+', label: 'AI Integrations' },
              { number: '10K+', label: 'Active Users' },
              { number: '1M+', label: 'Workflows Created' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
