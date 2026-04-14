'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }
    if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-600 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const email = session.user?.email || 'User';
  const name = session.user?.name || email.split('@')[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/harshai-logo.png" alt="HarshAI" className="w-8 h-8" />
            <span className="text-gray-900 font-medium text-lg">HarshAI Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm hidden md:block">
              {email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Welcome back, {name}
          </h1>
          <p className="text-gray-600">
            Manage your AI workflows and integrations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="text-3xl font-medium text-gray-900 mb-2">0</div>
            <div className="text-gray-600 text-sm">Workflows Created</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="text-3xl font-medium text-gray-900 mb-2">0</div>
            <div className="text-gray-600 text-sm">Total Runs</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="text-3xl font-medium text-gray-900 mb-2">0</div>
            <div className="text-gray-600 text-sm">AI Integrations</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/builder"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-600 transition-all group"
          >
            <div className="text-blue-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="text-gray-900 font-medium mb-1">Create Workflow</div>
            <div className="text-gray-600 text-sm">Build a new automation</div>
          </a>
          <a
            href="/integrations"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-600 transition-all group"
          >
            <div className="text-blue-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="text-gray-900 font-medium mb-1">Integrations</div>
            <div className="text-gray-600 text-sm">Connect your tools</div>
          </a>
          <a
            href="/templates"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-600 transition-all group"
          >
            <div className="text-blue-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div className="text-gray-900 font-medium mb-1">Templates</div>
            <div className="text-gray-600 text-sm">Browse pre-built flows</div>
          </a>
          <a
            href="/settings"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-600 transition-all group"
          >
            <div className="text-blue-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-gray-900 font-medium mb-1">Settings</div>
            <div className="text-gray-600 text-sm">Manage preferences</div>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2026 HarshAI. Built with care by Harshal Lahare</p>
        </div>
      </footer>
    </div>
  );
}
