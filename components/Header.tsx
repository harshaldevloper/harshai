'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-10 h-10 object-contain" />
            <span className="text-white font-bold text-xl">HarshAI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-indigo-200 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#use-cases" className="text-indigo-200 hover:text-white transition-colors">
              Use Cases
            </Link>
            <Link href="#pricing" className="text-indigo-200 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-indigo-200 hover:text-white transition-colors">
              About
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <button className="text-indigo-200 hover:text-white transition-colors">
              Sign In
            </button>
            <button className="bg-white text-indigo-900 px-6 py-2 rounded-full font-semibold hover:bg-indigo-100 transition-all transform hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
