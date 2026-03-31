'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="h-16 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-b border-white/10 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">H</span>
          </div>
          <span className="text-white font-bold text-lg">HarshAI Builder</span>
        </Link>
      </div>

      {/* Center - Workflow Name */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          defaultValue="Untitled Workflow"
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-indigo-300 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 text-indigo-200 hover:text-white transition-colors">
          Test
        </button>
        <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105">
          Save Workflow
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-indigo-200 hover:text-white transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </header>
  );
}
