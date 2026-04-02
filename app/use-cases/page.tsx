'use client';

import Link from 'next/link';

export default function UseCasesPage() {
  const useCases = [
    {
      title: '📝 Content Repurposing',
      desc: 'Automatically turn one piece of content into dozens across all platforms',
      steps: [
        'Upload YouTube video or blog post',
        'AI extracts transcript and key points',
        'Generate blog posts, tweets, LinkedIn posts',
        'Auto-schedule to all social platforms',
      ],
      icon: '🚀',
    },
    {
      title: '💼 Lead Processing',
      desc: 'Never miss a lead - automate your entire lead nurturing workflow',
      steps: [
        'Capture leads from forms, emails, or chats',
        'AI analyzes and categorizes leads',
        'Add to CRM automatically',
        'Send personalized follow-up emails',
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
        'Auto-publish to channels',
      ],
      icon: '✨',
    },
    {
      title: '📞 Smart Support',
      desc: 'Provide 24/7 AI-powered customer support',
      steps: [
        'Customer submits ticket',
        'AI analyzes sentiment and priority',
        'Drafts intelligent response',
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
      ],
      icon: '🛍️',
    },
  ];

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
          <Link href="/" className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            HarshAI
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            <Link href="/use-cases" className="text-white font-semibold">Use Cases</Link>
            <Link href="/demo" className="text-gray-300 hover:text-white transition-colors">Demo</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 py-20 px-6 pt-28">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Use Cases
          </h1>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            See how thousands of users are transforming their workflows with HarshAI
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {useCase.title}
                </h2>
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
    </div>
  );
}
