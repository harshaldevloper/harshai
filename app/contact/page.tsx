'use client';

import { HeroScene } from '../3d/HeroScene';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thanks for reaching out! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-6xl md:text-8xl font-black text-center mb-6 gradient-text">
            Contact Us
          </h1>
          <p className="text-2xl text-gray-300 text-center mb-16">
            Have questions? We'd love to hear from you.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="glass p-10 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white font-bold text-lg hover:scale-105 transition-transform"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="glass p-8 rounded-3xl">
                <h3 className="text-2xl font-bold mb-6 gradient-text">Get In Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">📧</div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <a href="mailto:hello@harshai.com" className="text-white hover:text-purple-400 transition-colors">
                        hello@harshai.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🐦</div>
                    <div>
                      <p className="text-gray-400 text-sm">Twitter</p>
                      <a href="https://twitter.com/harshai" className="text-white hover:text-purple-400 transition-colors">
                        @harshai
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">💬</div>
                    <div>
                      <p className="text-gray-400 text-sm">Discord</p>
                      <a href="https://discord.gg/harshai" className="text-white hover:text-purple-400 transition-colors">
                        Join our community
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl">
                <h3 className="text-2xl font-bold mb-4 gradient-text">Office Hours</h3>
                <p className="text-gray-400">Monday - Friday: 9AM - 6PM IST</p>
                <p className="text-gray-400">Weekend: By appointment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-gray-500">
        <p>© 2026 HarshAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
