'use client';

import Link from 'next/link';

export default function Home() {
  const gradientText = {
    background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #22d3ee 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const buttonGradient = {
    background: 'linear-gradient(135deg, #9333ea 0%, #06b6d4 100%)',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'relative',
        zIndex: 50,
        padding: '1rem 1.5rem',
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '2rem', fontWeight: 900, ...gradientText }}>
            HarshAI
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {['Home', 'About', 'Use Cases', 'Demo', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
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
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1.5rem',
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
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            <span style={gradientText}>Your AI Command Center</span>
          </h1>
          <p style={{ fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', color: '#9ca3af', marginBottom: '3rem', lineHeight: 1.7 }}>
            Connect 50+ AI tools into automated workflows. No code required.
            <br />Build once, automate forever.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/builder"
              style={{
                ...buttonGradient,
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'white',
                textDecoration: 'none',
                boxShadow: '0 10px 40px rgba(147, 51, 234, 0.4)',
                transition: 'transform 0.2s',
              }}
            >
              Try Builder →
            </Link>
            <Link
              href="/sign-up"
              style={{
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'white',
                textDecoration: 'none',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Get Started Free
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '5rem', maxWidth: '600px', margin: '5rem auto 0' }}>
            {[
              { number: '50+', label: 'AI Integrations' },
              { number: '10K+', label: 'Active Users' },
              { number: '1M+', label: 'Workflows Created' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, ...gradientText }}>
                  {stat.number}
                </div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" style={{ position: 'relative', zIndex: 10, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, textAlign: 'center', marginBottom: '4rem', ...gradientText }}>
            Why HarshAI?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '⚡', title: 'No Code Required', desc: 'Drag-and-drop visual builder. If you can use Canva, you can build AI workflows.' },
              { icon: '🔗', title: '50+ AI Integrations', desc: 'Connect ChatGPT, Claude, ElevenLabs, Jasper, Midjourney and 50+ more AI tools.' },
              { icon: '💰', title: 'Free to Start', desc: 'Free tier with 100 runs/month. Perfect for getting started with AI automation.' },
            ].map((feature) => (
              <div key={feature.title} style={{
                padding: '2rem',
                borderRadius: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.3s, border-color 0.3s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>{feature.title}</h3>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" style={{ position: 'relative', zIndex: 10, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, textAlign: 'center', marginBottom: '4rem', ...gradientText }}>
            What You Can Build
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📝', title: 'Content Repurposing', desc: 'YouTube video → AI transcript → Blog post → 10 social posts → Auto-schedule everywhere' },
              { icon: '💼', title: 'Lead Processing', desc: 'New email lead → AI extracts info → Add to CRM → Send personalized reply → Create follow-up task' },
              { icon: '🎨', title: 'Creative Production', desc: 'Blog topic → AI outline → AI draft → AI images → Auto-publish to WordPress' },
              { icon: '📞', title: 'Smart Support', desc: 'Support ticket → AI analyzes sentiment → AI drafts response → Send for approval → Auto-send' },
            ].map((useCase) => (
              <div key={useCase.title} style={{
                padding: '2rem',
                borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.3s, border-color 0.3s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{useCase.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>{useCase.title}</h3>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" style={{ position: 'relative', zIndex: 10, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, marginBottom: '2rem', ...gradientText }}>
            Ready to Start?
          </h2>
          <p style={{ fontSize: '1.5rem', color: '#9ca3af', marginBottom: '3rem' }}>
            Join thousands of creators automating their workflows
          </p>
          <Link
            href="/sign-up"
            style={{
              ...buttonGradient,
              display: 'inline-block',
              padding: '1.25rem 3rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: 'white',
              textDecoration: 'none',
              boxShadow: '0 20px 60px rgba(147, 51, 234, 0.4)',
              transition: 'transform 0.2s',
            }}
          >
            Start Building Free →
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ position: 'relative', zIndex: 10, padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, marginBottom: '2rem', ...gradientText }}>
            Get In Touch
          </h2>
          <div style={{
            padding: '2rem',
            borderRadius: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '2rem' }}>
              Have questions? We'd love to hear from you.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <a href="mailto:helloGitHub.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                📧 helloGitHub.com
              </a>
              <a href="https://github.com/harshaldevloper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                🐦 GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, padding: '3rem 1.5rem', textAlign: 'center', color: '#6b7280', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <p>Built with ❤️ by Harshal Lahare</p>
        <p style={{ marginTop: '0.5rem' }}>© 2026 HarshAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
