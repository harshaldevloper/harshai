'use client';

import { HeroScene } from '../3d/HeroScene';
import Link from 'next/link';

export default function UseCasesPage() {
  const useCases = [
    {
      title: '📝 Content Repurposing',
      desc: 'Automatically turn one piece of content into dozens of pieces across all platforms',
      steps: [
        'Upload YouTube video or blog post',
        'AI extracts transcript and key points',
        'Generate blog posts, tweets, LinkedIn posts',
        'Auto-schedule to all social platforms',
        'Track performance and optimize',
      ],
      icon: '🚀',
    },
    {
      title: '💼 Lead Processing',
      desc: 'Never miss a lead again - automate your entire lead nurturing workflow',
      steps: [
        'Capture leads from forms, emails, or chats',
        'AI analyzes and categorizes leads',
        'Add to CRM automatically',
        'Send personalized follow-up emails',
        'Create tasks and reminders',
      ],
      icon: '🎯',
    },
    {
      title: '🎨 Creative Production',
      desc: 'Create stunning content at scale with AI-powered automation',
      steps: [
        'Input topic or brief',
        'AI generates outline and draft',
        'Create AI-generated images',
        'Format for different platforms',
        'Auto-publish to channels',
      ],
      icon: '✨',
    },
    {
      title: '📞 Smart Support',
      desc: 'Provide 24/7 AI-powered customer support that actually helps',
      steps: [
        'Customer submits ticket',
        'AI analyzes sentiment and priority',
        'Drafts intelligent response',
        'Human approves or edits',
        'Auto-send and track resolution',
      ],
      icon: '💬',
    },
    {
      title: '📊 Data Analysis',
      desc: 'Turn raw data into actionable insights automatically',
      steps: [
        'Connect data sources',
        'AI analyzes trends and patterns',
        'Generate visualizations',
        'Create executive summaries',
        'Schedule regular reports',
      ],
      icon: '📈',
    },
    {
      title: '🛒 E-commerce Automation',
      desc: 'Streamline your entire e-commerce operations',
      steps: [
        'Sync inventory across platforms',
        'AI writes product descriptions',
        'Auto-generate marketing emails',
        'Personalize customer experiences',
        'Optimize pricing dynamically',
      ],
      icon: '🛍️',
    },
  ];

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

      <section className="relative z-10 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black text-center mb-6 gradient-text">
            Use Cases
          </h1>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            See how thousands of users are transforming their workflows with HarshAI
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <div key={i} className="glass p-8 rounded-3xl hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h2 className="text-2xl font-bold mb-4 gradient-text">{useCase.title}</h2>
                <p className="text-gray-400 mb-6">{useCase.desc}</p>
                <div className="space-y-2">
                  {useCase.steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      {step}
                    </div>
                  ))}
                </div>
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
