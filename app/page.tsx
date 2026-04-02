'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = ['Home', 'About', 'Use Cases', 'Demo', 'Contact'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', overflowX: 'hidden' }}>
      {/* Animated Background Orbs - Loop Forever */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000" />
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-8000" />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Navigation - Fixed: No horizontal overflow */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            HarshAI
          </Link>

          {/* Desktop Navigation - HIDDEN on mobile */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-300 hover:text-white font-medium transition-colors duration-200 text-sm"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/sign-up"
              className="bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2 rounded-full font-semibold text-white text-sm hover:scale-105 transition-transform duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl p-2"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/98 border-t border-white/10 px-6 py-4 flex flex-col gap-3">
            {navLinks.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white font-medium py-2"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 rounded-full font-semibold text-white text-center"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-5xl">
          {/* Badge */}
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-8 animate-pulse">
            ✨ The Future of AI Automation
          </div>

          {/* Main Heading with Gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Your AI Command Center
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect 50+ AI tools into automated workflows. No code required.
            <br className="hidden md:block" />
            Build once, automate forever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/builder"
              className="group bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              Try Builder →
            </Link>
            <Link
              href="/sign-up"
              className="px-8 py-4 border-2 border-purple-500/50 rounded-full font-bold text-lg hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-20 pt-10 border-t border-white/10">
            {[
              { value: '50+', label: 'AI Integrations' },
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Workflows Created' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm md:text-base mt-2 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="relative z-10 py-24 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Why HarshAI?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Stop juggling 10+ AI tools. Automate everything in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎨', title: 'Visual Builder', desc: 'Drag, drop, automate. No code required.' },
              { icon: '🔗', title: '50+ Integrations', desc: 'ChatGPT, Claude, ElevenLabs & more.' },
              { icon: '⚡', title: 'Smart Triggers', desc: 'Schedule, webhook, upload automation.' },
              { icon: '🧠', title: 'Conditional Logic', desc: 'If/then rules for smart workflows.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 HarshAI. All rights reserved.
        </p>
        <p className="text-gray-600 text-xs mt-4 max-w-2xl mx-auto">
          All third-party trademarks are property of their respective owners.
          HarshAI is not affiliated with, endorsed by, or sponsored by any mentioned companies.
        </p>
      </footer>
    </div>
  );
}
