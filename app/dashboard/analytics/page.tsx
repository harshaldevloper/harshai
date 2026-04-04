// HarshAI - Analytics Dashboard Page
// Day 30: Analytics Dashboard

'use client';

import React, { useState, useEffect } from 'react';
import { UserButton, currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StatsCard from '@/components/analytics/StatsCard';
import ExecutionTrendChart from '@/components/analytics/ExecutionTrendChart';
import TopWorkflowsList from '@/components/analytics/TopWorkflowsList';
import RecentExecutionsTable from '@/components/analytics/RecentExecutionsTable';
import DateRangeFilter from '@/components/analytics/DateRangeFilter';

interface AnalyticsSummary {
  totalWorkflows: number;
  totalExecutions: number;
  executionsToday: number;
  executionsThisWeek: number;
  executionsThisMonth: number;
  successRate: number;
  avgExecutionTime: number;
  mostActiveWorkflow: {
    id: string;
    name: string;
    count: number;
  } | null;
  failedExecutions: number;
}

interface TrendData {
  date: string;
  count: number;
  successCount: number;
  failedCount: number;
}

interface TopWorkflow {
  id: string;
  name: string;
  executionCount: number;
  successRate: number;
  avgExecutionTime: number;
}

interface RecentExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  duration: number | null;
  error?: string;
}

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [topWorkflows, setTopWorkflows] = useState<TopWorkflow[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [summaryRes, trendsRes, workflowsRes, executionsRes] = await Promise.all([
        fetch('/api/analytics/summary'),
        fetch('/api/analytics/trends?days=7'),
        fetch('/api/analytics/workflows/top'),
        fetch('/api/analytics/executions?limit=10')
      ]);

      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      if (!trendsRes.ok) throw new Error('Failed to fetch trends');
      
      const summaryData = await summaryRes.json();
      const trendsData = await trendsRes.json();
      const workflowsData = await workflowsRes.ok ? await workflowsRes.json() : { workflows: [] };
      const executionsData = await executionsRes.ok ? await executionsRes.json() : { executions: [] };

      setSummary(summaryData);
      setTrends(trendsData.trends || []);
      setTopWorkflows(workflowsData.workflows || []);
      setRecentExecutions(executionsData.executions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Analytics</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-white font-bold text-lg">HarshAI Analytics</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </Link>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-white/60">Track your workflow performance and usage patterns</p>
          </div>
          <DateRangeFilter />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Workflows"
            value={summary?.totalWorkflows || 0}
            subtitle="Created workflows"
            icon="📊"
            color="purple"
          />
          
          <StatsCard
            title="Total Executions"
            value={summary?.totalExecutions || 0}
            subtitle={`${summary?.executionsToday || 0} today · ${summary?.executionsThisWeek || 0} this week`}
            icon="⚡"
            color="blue"
          />
          
          <StatsCard
            title="Success Rate"
            value={`${summary?.successRate || 0}%`}
            subtitle={`${summary?.failedExecutions || 0} failed executions`}
            icon="✓"
            color={summary && summary.successRate >= 90 ? 'green' : summary && summary.successRate >= 70 ? 'orange' : 'red'}
          />
          
          <StatsCard
            title="Avg Execution Time"
            value={formatDuration(summary?.avgExecutionTime || 0)}
            subtitle="Average per execution"
            icon="⏱"
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Execution Trend Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ExecutionTrendChart 
              data={trends} 
              title="Execution Trends (Last 7 Days)"
            />
          </div>
          
          {/* Most Active Workflow */}
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Most Active Workflow</h3>
            {summary?.mostActiveWorkflow ? (
              <div className="space-y-4">
                <div className="text-4xl mb-2">🏆</div>
                <Link 
                  href={`/dashboard/workflows/${summary.mostActiveWorkflow.id}`}
                  className="block group"
                >
                  <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {summary.mostActiveWorkflow.name}
                  </h4>
                </Link>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Executions</span>
                    <span className="text-white font-medium">{summary.mostActiveWorkflow.count}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-white/50">
                No workflows yet
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Workflows */}
          <TopWorkflowsList 
            workflows={topWorkflows}
            title="Top 5 Workflows"
          />
          
          {/* Recent Executions */}
          <RecentExecutionsTable 
            executions={recentExecutions}
            title="Recent Executions"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Executions Today</h3>
            <div className="text-3xl font-bold text-green-400">{summary?.executionsToday || 0}</div>
            <p className="text-sm text-white/50 mt-1">Last 24 hours</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Executions This Week</h3>
            <div className="text-3xl font-bold text-blue-400">{summary?.executionsThisWeek || 0}</div>
            <p className="text-sm text-white/50 mt-1">Last 7 days</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Executions This Month</h3>
            <div className="text-3xl font-bold text-purple-400">{summary?.executionsThisMonth || 0}</div>
            <p className="text-sm text-white/50 mt-1">Current month</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-white/40 text-sm">
          <p>© 2026 HarshAI Analytics. Built with ❤️ by Harshal Lahare</p>
        </div>
      </footer>
    </div>
  );
}
