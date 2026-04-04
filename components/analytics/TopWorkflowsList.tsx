// HarshAI - TopWorkflowsList Component
// Day 30: Analytics Dashboard

'use client';

import React from 'react';
import Link from 'next/link';

interface TopWorkflow {
  id: string;
  name: string;
  executionCount: number;
  successRate: number;
  avgExecutionTime: number;
}

interface TopWorkflowsListProps {
  workflows: TopWorkflow[];
  title?: string;
}

export default function TopWorkflowsList({ workflows, title }: TopWorkflowsListProps) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  if (!workflows || workflows.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">{title || 'Top Workflows'}</h3>
        <div className="flex items-center justify-center h-40 text-white/50">
          No workflows yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title || 'Top Workflows'}</h3>
      
      <div className="space-y-3">
        {workflows.map((workflow, index) => (
          <Link
            key={workflow.id}
            href={`/dashboard/workflows/${workflow.id}`}
            className="block group"
          >
            <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all">
              <div className="text-xl w-8 text-center">
                {getRankIcon(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                  {workflow.name}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                  <span>{workflow.executionCount} executions</span>
                  <span>•</span>
                  <span className={workflow.successRate >= 90 ? 'text-green-400' : workflow.successRate >= 70 ? 'text-yellow-400' : 'text-red-400'}>
                    {workflow.successRate}% success
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-white/80">
                  {formatDuration(workflow.avgExecutionTime)}
                </div>
                <div className="text-xs text-white/50">
                  avg time
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
