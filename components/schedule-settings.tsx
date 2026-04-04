// HarshAI - Schedule Settings Component
// Day 26: Scheduled Workflows (Cron Triggers)

'use client';

import { useState } from 'react';

interface ScheduleSettingsProps {
  workflowId: string;
  currentSchedule?: {
    cronExpression?: string;
    scheduleEnabled?: boolean;
    nextExecutedAt?: string;
  };
}

export default function ScheduleSettings({ 
  workflowId,
  currentSchedule 
}: ScheduleSettingsProps) {
  const [cronExpression, setCronExpression] = useState(
    currentSchedule?.cronExpression || '0 0 * * *' // Default: daily at midnight
  );
  const [scheduleEnabled, setScheduleEnabled] = useState(
    currentSchedule?.scheduleEnabled || false
  );
  const [nextRun, setNextRun] = useState(currentSchedule?.nextExecutedAt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { label: 'Every Minute', value: '* * * * *' },
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Daily (Midnight)', value: '0 0 * * *' },
    { label: 'Daily (9 AM)', value: '0 9 * * *' },
    { label: 'Weekly (Sunday)', value: '0 0 * * 0' },
    { label: 'Monthly (1st)', value: '0 0 1 * *' },
  ];

  const handleSaveSchedule = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cronExpression,
          triggerType: 'cron'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save schedule');
      }

      setNextRun(data.nextRun);
      alert('Schedule saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSchedule = async () => {
    if (!confirm('Are you sure you want to remove the schedule?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove schedule');
      }

      setCronExpression('0 0 * * *');
      setScheduleEnabled(false);
      setNextRun(undefined);
      alert('Schedule removed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (value: string) => {
    setCronExpression(value);
  };

  const formatNextRun = (dateStr?: string) => {
    if (!dateStr) return 'Not scheduled';
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Schedule Automation</h3>
      
      {/* Enable/Disable Toggle */}
      <div className="flex items-center mb-4">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
            />
            <div className={`block w-14 h-8 rounded-full ${scheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${scheduleEnabled ? 'transform translate-x-6' : ''}`}></div>
          </div>
          <span className="ml-3 text-sm font-medium">Enable scheduled runs</span>
        </label>
      </div>

      {/* Cron Expression Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Cron Expression
          <span className="text-gray-500 text-xs ml-2">
            minute hour day month dayOfWeek
          </span>
        </label>
        <input
          type="text"
          value={cronExpression}
          onChange={(e) => setCronExpression(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="0 0 * * *"
          disabled={!scheduleEnabled || isLoading}
        />
      </div>

      {/* Presets */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Quick Presets</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`px-3 py-2 text-sm rounded border ${
                cronExpression === preset.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={!scheduleEnabled || isLoading}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Next Run Time */}
      {nextRun && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Next run:</span> {formatNextRun(nextRun)}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {scheduleEnabled && (
          <button
            onClick={handleRemoveSchedule}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Remove Schedule
          </button>
        )}
        <button
          onClick={handleSaveSchedule}
          disabled={isLoading || !scheduleEnabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs text-gray-600">
        <p className="font-medium mb-1">Cron Expression Guide:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><code className="bg-gray-200 px-1">*</code> = Every unit (every minute, every hour, etc.)</li>
          <li><code className="bg-gray-200 px-1">0-59</code> = Specific minute</li>
          <li><code className="bg-gray-200 px-1">0-23</code> = Specific hour (24-hour format)</li>
          <li><code className="bg-gray-200 px-1">1-31</code> = Specific day of month</li>
          <li><code className="bg-gray-200 px-1">1-12</code> = Specific month</li>
          <li><code className="bg-gray-200 px-1">0-7</code> = Specific day of week (0=Sunday, 7=Sunday)</li>
        </ul>
      </div>
    </div>
  );
}
