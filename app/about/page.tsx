'use client';

import { HeroScene } from '../3d/HeroScene';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3e] to-[#0f0f23] overflow-hidden">
      <HeroScene />
      
      <nav className="relative z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold gradient-text">HarshAI</Link>
          <div className="flex gap-8">
            {['Home', 'About', 'Use Cases', 'Demo', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <section className="relative z-10 min-h-screen flex items-center px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-12 gradient-text">
            About HarshAI
          </h1>
          
          <div className="glass p-12 rounded-3xl mb-12">
            <p className="text-2xl text-gray-300 mb-8">
              HarshAI is the ultimate AI automation platform for creators, entrepreneurs, and businesses.
              We believe everyone should have access to powerful AI tools without needing to write a single line of code.
            </p>
            <p className="text-xl text-gray-400 mb-8">
              Founded by Harshal Lahare, HarshAI was built to solve a simple problem: AI tools are amazing, but they're scattered across dozens of platforms. 
              Our mission is to bring them all together in one beautiful, intuitive platform where you can build automated workflows in minutes.
            </p>
            <p className="text-xl text-gray-400">
              Whether you're a content creator looking to automate your social media, a business owner wanting to streamline customer support, 
              or a developer building the next big thing - HarshAI has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '50+', label: 'AI Integrations' },
              { number: '10K+', label: 'Active Users' },
              { number: '1M+', label: 'Workflows Created' },
            ].map((stat, i) => (
              <div key={i} className="glass p-8 rounded-2xl text-center">
                <div className="text-5xl font-black gradient-text mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-gray-500">
        <p>© 2026 HarshAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
