'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const gradientText = {
    background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #22d3ee 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const buttonGradient = {
    background: 'linear-gradient(135deg, #9333ea 0%, #06b6d4 100%)',
  };

  const navLinks = ['Home', 'About', 'Use Cases', 'Demo', 'Contact'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', overflowX: 'hidden' }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '1rem 1.5rem',
        backdropFilter: 'blur(20px)',
        background: 'rgba(10, 10, 15, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <Link href="/" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, ...gradientText, textDecoration: 'none' }}>
            HarshAI
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: 'none', md: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden md:flex">
            {navLinks.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s', fontSize: '0.95rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                {item}
              </Link>
            ))}
            <Link
              href="/sign-up"
              style={{
                ...buttonGradient,
                padding: '0.625rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'block',
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(10, 10, 15, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }} className="md:hidden">
            {navLinks.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, fontSize: '1.1rem', padding: '0.5rem 0' }}
              >
                {item}
              </Link>
            ))}
            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                ...buttonGradient,
                padding: '0.875rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                textAlign: 'center',
                marginTop: '0.5rem',
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 1.5rem 4rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: 'rgba(147, 51, 234, 0.1)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '9999px',
            color: '#c4b5fd',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '2rem',
          }}>
            ✨ The Future of AI Automation
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
            fontWeight: 900, 
            marginBottom: '1.5rem', 
            lineHeight: 1.1,
            ...gradientText 
          }}>
            Your AI Command Center
          </h1>
          <p style={{ 
            fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', 
            color: '#9ca3af', 
            marginBottom: '3rem', 
            lineHeight: 1.7,
          }}>
            Connect 50+ AI tools into automated workflows. No code required.
            <br style={{ display: 'none', sm: 'inline' }} />
            Build once, automate forever.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/builder"
              style={{
                ...buttonGradient,
                padding: '1rem 2.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                transition: 'transform 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Try Builder →
            </Link>
            <Link
              href="/sign-up"
              style={{
                background: 'transparent',
                border: '2px solid rgba(147, 51, 234, 0.5)',
                padding: '1rem 2.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                transition: 'all 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
              }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '2rem',
            marginTop: '5rem',
            padding: '2rem 0',
          }}>
            {[
              { value: '50+', label: 'AI Integrations' },
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Workflows Created' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 900,
                  ...gradientText,
                }}>
                  {stat.value}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HarshAI Section */}
      <section id="about" style={{
        position: 'relative',
        zIndex: 10,
        padding: '6rem 1.5rem',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              marginBottom: '1rem',
              ...gradientText,
            }}>
              Why HarshAI?
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', maxWidth: '600px', margin: '0 auto' }}>
              Stop juggling 10+ AI tools. Automate everything in one place.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { icon: '🎨', title: 'Visual Builder', desc: 'Drag, drop, automate. No code required. If you can use Canva, you can build workflows.' },
              { icon: '🔗', title: '50+ Integrations', desc: 'ChatGPT, Claude, ElevenLabs, Midjourney, and 45+ more AI tools connected.' },
              { icon: '⚡', title: 'Smart Triggers', desc: 'Schedule, webhook, upload, email. Workflows run automatically when you need them.' },
              { icon: '🧠', title: 'Conditional Logic', desc: 'Add intelligence with if/then rules. Make workflows smart, not just automated.' },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{feature.title}</h3>
                <p style={{ color: '#9ca3af', lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '3rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
      }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          © 2026 HarshAI. All rights reserved.
        </p>
        <p style={{ color: '#4b5563', fontSize: '0.75rem', marginTop: '1rem' }}>
          All third-party trademarks are property of their respective owners.
          HarshAI is not affiliated with, endorsed by, or sponsored by any mentioned companies.
        </p>
      </footer>
    </div>
  );
}
