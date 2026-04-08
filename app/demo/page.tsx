'use client';

import Link from 'next/link';

export default function DemoPage() {
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
          <Link href="/" className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-12 h-12" />
            <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              HarshAI
            </span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            <Link href="/use-cases" className="text-gray-300 hover:text-white transition-colors">Use Cases</Link>
            <Link href="/demo" className="text-white font-semibold">Demo</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 min-h-screen flex items-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            See It In Action
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Watch how easy it is to build your first AI workflow
          </p>

          {/* Demo Placeholder */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 max-w-4xl mx-auto mb-12 border border-white/10">
            <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Demo Video Coming Soon
                </p>
                <p className="text-gray-400 mt-2">We're creating an amazing walkthrough for you</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds' },
                { step: '2', title: 'Choose Template', desc: 'Pick from 50+ pre-built workflows' },
                { step: '3', title: 'Customize', desc: 'Customize with your AI tools' },
                { step: '4', title: 'Launch', desc: 'Deploy and automate instantly' },
              ].map((item) => (
                <div key={item.step} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {item.title}
                  </h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/sign-up"
            className="inline-block bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-200"
          >
            Try Builder Now →
          </Link>
        </div>
      </section>
    </div>
  );
}
