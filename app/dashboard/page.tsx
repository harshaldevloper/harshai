import { UserButton, currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="text-white font-bold text-lg">HarshAI Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-indigo-200 text-sm">
              {user.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                  userButtonPopoverCard: 'bg-indigo-900 border border-white/20',
                  userButtonPopoverActionButton: 'text-white hover:bg-white/10',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to HarshAI, {user.firstName || user.emailAddresses[0]?.emailAddress}! 🎉
          </h1>
          
          <p className="text-indigo-200 mb-8">
            Your AI Command Center is being built. Check back soon for workflow automation tools!
          </p>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-indigo-300">Workflows Created</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-indigo-300">Total Runs</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-indigo-300">AI Integrations</div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              🚀 Building Something Amazing
            </h2>
            <p className="text-indigo-200 mb-6">
              We're currently building the workflow builder. Soon you'll be able to:
            </p>
            <ul className="space-y-3 text-indigo-200">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Connect 50+ AI tools (ChatGPT, Claude, ElevenLabs, etc.)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Create automated workflows with drag-and-drop
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Run workflows automatically on triggers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Track usage and analytics
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-indigo-400 text-sm">
          <p>© 2026 HarshAI. Built with ❤️ by Harshal Lahare</p>
        </div>
      </footer>
    </div>
  );
}
