'use client';

import { HeroScene } from '../3d/HeroScene';
import Link from 'next/link';

export default function DemoPage() {
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
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8 gradient-text">
            See It In Action
          </h1>
          <p className="text-2xl text-gray-300 mb-12">
            Watch how easy it is to build your first AI workflow
          </p>

          {/* Demo Placeholder - Could be a video or interactive demo */}
          <div className="glass p-12 rounded-3xl max-w-4xl mx-auto mb-12">
            <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-2xl flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-2xl font-bold gradient-text">Demo Video Coming Soon</p>
                <p className="text-gray-400 mt-2">We're creating an amazing walkthrough for you</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                { step: '1', title: 'Sign Up', desc: 'Create your free account in seconds' },
                { step: '2', title: 'Choose Template', desc: 'Pick from 50+ pre-built workflows' },
                { step: '3', title: 'Customize & Launch', desc: 'Make it yours and go live instantly' },
              ].map((item) => (
                <div key={item.step} className="glass p-6 rounded-2xl">
                  <div className="text-4xl font-black gradient-text mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/sign-up"
            className="inline-block px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-white font-bold text-xl hover:scale-110 transition-all shadow-xl shadow-purple-500/50"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-gray-500">
        <p>© 2026 HarshAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
