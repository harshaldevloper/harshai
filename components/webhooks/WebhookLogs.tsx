'use client';

import { useState, useEffect } from 'react';

interface WebhookLog {
  id: string;
  workflowId: string;
  payload: any;
  receivedAt: string;
  status: 'received' | 'processing' | 'completed' | 'failed';
  response?: any;
  ipAddress?: string;
  userAgent?: string;
  error?: string;
}

interface WebhookLogsProps {
  workflowId: string;
}

export function WebhookLogs({ workflowId }: WebhookLogsProps) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    totalCount: 0,
    hasMore: false,
  });

  useEffect(() => {
    loadLogs();
  }, [workflowId, filter, pagination.offset]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      if (filter !== 'all') {
        params.set('status', filter);
      }
      
      const res = await fetch(`/api/webhooks/${workflowId}/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateJson = (obj: any, maxLength: number = 200) => {
    const str = JSON.stringify(obj);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Webhook Logs</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
            <option value="received">Received</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No webhook logs yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Send a POST request to your webhook URL to see logs here
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payload Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTime(log.receivedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate font-mono">
                      {truncateJson(log.payload)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedLog === log.id ? 'Collapse' : 'Expand'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Log Details */}
          {expandedLog && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {logs.filter(l => l.id === expandedLog).map(log => (
                <div key={log.id} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Full Payload</h4>
                    <pre className="bg-white border border-gray-200 rounded-md p-4 overflow-x-auto text-sm font-mono">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                  
                  {log.response && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Response</h4>
                      <pre className="bg-white border border-gray-200 rounded-md p-4 overflow-x-auto text-sm font-mono">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.error && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">Error</h4>
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                        {log.error}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4 text-xs text-gray-500">
                    {log.userAgent && (
                      <span>User Agent: {log.userAgent}</span>
                    )}
                    <span>Log ID: {log.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.hasMore && (
            <div className="p-4 border-t border-gray-200 flex justify-center">
              <button
                onClick={() => setPagination(p => ({ ...p, offset: p.offset + p.limit }))}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
