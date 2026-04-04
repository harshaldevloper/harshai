// HarshAI - RecentExecutionsTable Component
// Day 30: Analytics Dashboard

'use client';

import React, { useState } from 'react';

interface RecentExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  duration: number | null;
  error?: string;
}

interface RecentExecutionsTableProps {
  executions: RecentExecution[];
  title?: string;
  onViewDetails?: (execution: RecentExecution) => void;
}

export default function RecentExecutionsTable({ 
  executions, 
  title,
  onViewDetails 
}: RecentExecutionsTableProps) {
  const [selectedExecution, setSelectedExecution] = useState<RecentExecution | null>(null);

  const formatDuration = (ms: number | null) => {
    if (ms === null || ms === undefined) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'failed': return '✕';
      case 'running': return '⟳';
      case 'pending': return '⏳';
      default: return '•';
    }
  };

  const handleViewDetails = (execution: RecentExecution) => {
    if (onViewDetails) {
      onViewDetails(execution);
    } else {
      setSelectedExecution(execution);
    }
  };

  if (!executions || executions.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">{title || 'Recent Executions'}</h3>
        <div className="flex items-center justify-center h-40 text-white/50">
          No executions yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title || 'Recent Executions'}</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">
                Workflow
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">
                Started
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">
                Duration
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {executions.map((execution) => (
              <tr 
                key={execution.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(execution.status)}`}>
                    <span className="text-sm">{getStatusIcon(execution.status)}</span>
                    {execution.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-white font-medium">
                    {execution.workflowName}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-white/70">
                    {formatDateTime(execution.startedAt)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-white/70">
                    {formatDuration(execution.duration)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleViewDetails(execution)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Execution Details Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-white">Execution Details</h3>
                <button
                  onClick={() => setSelectedExecution(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedExecution.status)}`}>
                      <span className="text-sm">{getStatusIcon(selectedExecution.status)}</span>
                      {selectedExecution.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Workflow</p>
                    <p className="text-white font-medium">{selectedExecution.workflowName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Started At</p>
                    <p className="text-white">{formatDateTime(selectedExecution.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Duration</p>
                    <p className="text-white">{formatDuration(selectedExecution.duration)}</p>
                  </div>
                </div>

                {selectedExecution.error && (
                  <div>
                    <p className="text-sm text-white/60 mb-2">Error:</p>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <pre className="text-sm text-red-400 whitespace-pre-wrap break-words">
                        {selectedExecution.error}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
