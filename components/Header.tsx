'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-10 h-10 object-contain" />
            <span className="text-white font-bold text-xl">HarshAI</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-indigo-200 hover:text-white transition-colors">
              Sign In
            </button>
            <button className="bg-white text-indigo-900 px-6 py-2 rounded-full font-semibold hover:bg-indigo-100 transition-all transform hover:scale-105">
              Get Started
            </button>
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
          <div className="md:hidden bg-black/98 border-t border-white/10 mt-4 px-6 py-4 flex flex-col gap-3 rounded-lg">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white font-medium py-2"
            >
              Features
            </Link>
            <Link
              href="#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white font-medium py-2"
            >
              Use Cases
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white font-medium py-2"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white font-medium py-2"
            >
              About
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 rounded-full font-semibold text-white text-center mt-2"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
