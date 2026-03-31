export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            HarshAI
          </h1>
          <p className="text-2xl text-indigo-200 mb-8">
            Your AI Command Center
          </p>
          <p className="text-lg text-indigo-300 max-w-2xl mx-auto mb-12">
            The all-in-one AI automation platform for creators. 
            Connect ChatGPT, ElevenLabs, Jasper & 50+ AI tools into automated workflows. 
            No code required.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-100 transition-all transform hover:scale-105">
              Join Waitlist
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-indigo-900 transition-all">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">No Code Required</h3>
            <p className="text-indigo-200">
              Drag-and-drop visual builder. If you can use Canva, you can build AI workflows.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-white mb-2">50+ AI Integrations</h3>
            <p className="text-indigo-200">
              Connect ChatGPT, Claude, ElevenLabs, Jasper, Midjourney and 50+ more AI tools.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Free to Start</h3>
            <p className="text-indigo-200">
              Free tier with 100 runs/month. Perfect for getting started with AI automation.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-8">
            🚀 What You Can Build
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">📝 Content Repurposing</h4>
              <p className="text-indigo-200 text-sm">
                YouTube video → AI transcript → Blog post → 10 social posts → Auto-schedule everywhere
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">💼 Lead Processing</h4>
              <p className="text-indigo-200 text-sm">
                New email lead → AI extracts info → Add to CRM → Send personalized reply → Create follow-up task
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">🎨 Creative Production</h4>
              <p className="text-indigo-200 text-sm">
                Blog topic → AI outline → AI draft → AI images → Auto-publish to WordPress
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">📞 Smart Support</h4>
              <p className="text-indigo-200 text-sm">
                Support ticket → AI analyzes sentiment → AI drafts response → Send for approval → Auto-send
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-indigo-300">
          <p className="mb-4">
            Built with ❤️ by Harshal Lahare
          </p>
          <p className="text-sm">
            © 2026 HarshAI. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  )
}
